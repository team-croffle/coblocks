import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  run,
  validateProgram,
  validateStage,
  type BlockProgram,
  type LessonProgress,
  type RunResult,
  type StageConfig,
} from '@coblocks/shared';
import { AuditService } from '../common/audit.service';
import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import { lessons, progress } from '../db/schema';

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
    user: { id: string; memberNo: string },
    lessonId: string,
    program: BlockProgram,
    ip: string,
  ): Promise<RunResult> {
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
    const [existing] = await this.db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.lessonId, lessonId)))
      .limit(1);

    const values = {
      state: succeeded ? ('completed' as const) : ('in_progress' as const),
      program,
      attempts: (existing?.attempts ?? 0) + 1,
      completedAt: succeeded ? new Date() : (existing?.completedAt ?? null),
      updatedAt: new Date(),
    };

    if (existing) {
      await this.db.update(progress).set(values).where(eq(progress.id, existing.id));
    } else {
      await this.db.insert(progress).values({ userId: user.id, lessonId, ...values });
    }

    await this.audit.record({
      category: 'activity',
      actorId: user.id,
      actorLabel: user.memberNo,
      action: succeeded ? '미션 완료' : '미션 실행',
      target: lesson.title,
      outcome: succeeded ? 'success' : 'pending',
      ip,
      meta: {
        outcome: result.outcome,
        steps: result.steps.length,
        ...(programIssue ? { invalidReason: programIssue.reason } : {}),
        ...(stageIssue ? { stageIssue: stageIssue.reason } : {}),
      },
    });

    return result;
  }
}
