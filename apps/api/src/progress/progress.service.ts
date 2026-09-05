import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import {
  accountLevel,
  asLessonLevel,
  lessonXp,
  run,
  validateProgram,
  validateStage,
  type AttemptResult,
  type BlockProgram,
  type LessonProgress,
  type RunResult,
  type StageConfig,
} from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import type { Db, DbTransaction } from '../db/client';
import { DB } from '../db/database.module';
import { lessonAwards, lessons, progress, users } from '../db/schema';

@Injectable()
export class ProgressService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  async mine(userId: string): Promise<LessonProgress[]> {
    const rows = await this.db.select().from(progress).where(eq(progress.userId, userId));
    return rows.map((r) => ({
      lessonId: r.lessonId,
      state: r.state,
      program: r.program,
      workspace: r.workspace,
      attempts: r.attempts,
      completedAt: r.completedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * 제출된 프로그램을 서버에서 다시 실행해 채점한다.
   * 클라이언트 결과를 믿지 않는 것이 핵심 — 완료 여부는 여기서만 정해진다.
   */
  async attempt(
    user: { id: string; label: string },
    lessonId: string,
    program: BlockProgram,
    workspace: unknown,
    ip: string,
  ): Promise<AttemptResult> {
    const [lesson] = await this.db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (!lesson) throw new NotFoundException('미션을 찾을 수 없습니다.');

    // 클라이언트가 보낸 것은 형태부터 믿지 않는다. 검증을 통과한 것만 실행한다.
    const programIssue = validateProgram(program);
    const stage = lesson.stage as StageConfig | null;
    const stageIssue = stage ? validateStage(stage) : null;

    let result: RunResult;
    if (programIssue) {
      result = { outcome: 'invalid', steps: [], failedAt: programIssue.index };
    } else if (!stage || stageIssue) {
      // 스테이지가 없는 활동형 미션이거나, 등록된 스테이지가 깨진 경우.
      result = { outcome: stageIssue ? 'invalid' : 'missed_goal', steps: [], failedAt: null };
    } else {
      result = run(stage, program);
    }

    const succeeded = result.outcome === 'success';

    // 진도 기록과 XP 지급은 한 트랜잭션에서 끝낸다. 중간에 끊기면 둘 다 없던 일이 되어야 한다.
    const { awardedXp, totalXp } = await this.db.transaction(async (tx) => {
      // 같은 사용자의 동시 제출을 줄 세운다 — 두 번 눌러 XP 가 두 번 들어가지 않게.
      await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, user.id))
        .for('update')
        .limit(1);

      const [existing] = await tx
        .select()
        .from(progress)
        .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)))
        .limit(1);
      const wasCompleted = existing?.state === 'completed';

      const values = {
        state: succeeded ? ('completed' as const) : ('in_progress' as const),
        program,
        workspace,
        attempts: (existing?.attempts ?? 0) + 1,
        completedAt: succeeded
          ? (existing?.completedAt ?? new Date())
          : (existing?.completedAt ?? null),
        updatedAt: new Date(),
      };

      if (existing) {
        await tx.update(progress).set(values).where(eq(progress.id, existing.id));
      } else {
        await tx.insert(progress).values({ userId: user.id, lessonId, ...values });
      }

      if (!succeeded) {
        const [row] = await tx
          .select({ xp: users.xp })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        return { awardedXp: 0, totalXp: row?.xp ?? 0 };
      }

      return this.grantXp(tx, user.id, lessonId, lesson.level, wasCompleted);
    });

    await this.audit.record({
      category: 'activity',
      actorId: user.id,
      actorLabel: user.label,
      action: succeeded ? '미션 완료' : '미션 실행',
      target: lesson.title,
      outcome: succeeded ? 'success' : 'pending',
      ip,
      meta: {
        outcome: result.outcome,
        steps: result.steps.length,
        awardedXp,
        ...(programIssue ? { invalidReason: programIssue.reason } : {}),
        ...(stageIssue ? { stageIssue: stageIssue.reason } : {}),
      },
    });

    return { ...result, awardedXp, totalXp, level: accountLevel(totalXp) };
  }

  /**
   * XP 원장에 기록하고 부족한 만큼만 더한다.
   *
   * - 이미 받은 만큼은 다시 주지 않는다: `max(0, 목표 - 이미 준 양)`.
   * - **이 기능이 생기기 전에 이미 완료한 미션은 소급 지급하지 않는다.** 원장에 0 으로 적어
   *   정산을 끝내 두고, 다시 풀어도 0 이 되게 한다. 원장은 "실제로 준 양"만 담는다.
   */
  private async grantXp(
    tx: DbTransaction,
    userId: string,
    lessonId: string,
    level: number,
    wasCompleted: boolean,
  ): Promise<{ awardedXp: number; totalXp: number }> {
    const [award] = await tx
      .select()
      .from(lessonAwards)
      .where(and(eq(lessonAwards.userId, userId), eq(lessonAwards.lessonId, lessonId)))
      .limit(1);

    const target = !award && wasCompleted ? 0 : lessonXp(asLessonLevel(level));
    const granted = award?.awardedXp ?? 0;
    const delta = Math.max(0, target - granted);

    if (award) {
      if (delta > 0) {
        await tx
          .update(lessonAwards)
          .set({ awardedXp: granted + delta, updatedAt: new Date() })
          .where(eq(lessonAwards.id, award.id));
      }
    } else {
      await tx.insert(lessonAwards).values({ userId, lessonId, awardedXp: delta });
    }

    if (delta === 0) {
      const [row] = await tx
        .select({ xp: users.xp })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return { awardedXp: 0, totalXp: row?.xp ?? 0 };
    }

    const [row] = await tx
      .update(users)
      .set({ xp: sql`${users.xp} + ${delta}` })
      .where(eq(users.id, userId))
      .returning({ xp: users.xp });

    return { awardedXp: delta, totalXp: row?.xp ?? 0 };
  }
}
