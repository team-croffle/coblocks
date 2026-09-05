import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';

import type {
  AuditCategory,
  AuditLog,
  Inquiry,
  Lesson,
  MaskedUser,
  Paginated,
  SystemOverview,
} from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import { maskNickname, maskStudentNo } from '../common/masking';
import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import {
  auditLogs,
  inquiries,
  lessonRevisions,
  lessons,
  unmaskRequests,
  users,
} from '../db/schema';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  async overview(): Promise<SystemOverview> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [logins] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(and(gte(auditLogs.occurredAt, startOfDay), eq(auditLogs.action, '로그인 성공')));

    const [failures] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(and(gte(auditLogs.occurredAt, startOfDay), eq(auditLogs.action, '로그인 실패')));

    const [runs] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(and(gte(auditLogs.occurredAt, startOfDay), eq(auditLogs.category, 'activity')));

    // 시간대별 접속: 로그인 성공 로그를 시(hour) 단위로 센다.
    const hourly = await this.db
      .select({
        hour: sql<number>`extract(hour from ${auditLogs.occurredAt})::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .where(and(gte(auditLogs.occurredAt, startOfDay), eq(auditLogs.category, 'access')))
      .groupBy(sql`1`);

    const hourlyOnline = Array.from(
      { length: 24 },
      (_, h) => hourly.find((r) => r.hour === h)?.count ?? 0,
    );

    return {
      // TODO: 실시간 접속자는 세션 저장소(Redis)가 붙으면 교체
      onlineNow: 0,
      loginsToday: logins?.count ?? 0,
      loginFailuresToday: failures?.count ?? 0,
      programRunsToday: runs?.count ?? 0,
      hourlyOnline,
      services: [
        { name: '블록 실행 엔진', status: 'ok', note: 'shared 인터프리터' },
        { name: '인증 서버', status: 'ok', note: 'JWT' },
        { name: '학습 기록 DB', status: 'ok', note: 'PostgreSQL' },
      ],
    };
  }

  async auditLogList(params: {
    q?: string;
    categories?: AuditCategory[];
    page?: number;
  }): Promise<Paginated<AuditLog>> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = 50;

    const filters: SQL[] = [];
    if (params.categories?.length) filters.push(inArray(auditLogs.category, params.categories));
    if (params.q) {
      const like = `%${params.q}%`;
      const search = or(
        ilike(auditLogs.actorLabel, like),
        ilike(auditLogs.action, like),
        ilike(auditLogs.target, like),
        ilike(auditLogs.ip, like),
      );
      if (search) filters.push(search);
    }
    const where = filters.length ? and(...filters) : undefined;

    const rows = await this.db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.occurredAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(where);

    return {
      items: rows.map((r) => ({
        id: r.id,
        occurredAt: r.occurredAt.toISOString().slice(0, 19).replace('T', ' '),
        category: r.category,
        actor: r.actorLabel,
        action: r.action,
        target: r.target,
        ip: r.ip,
        outcome: r.outcome,
      })),
      total: countRow?.count ?? 0,
      page,
      pageSize,
    };
  }

  /** 사용자 목록은 반드시 마스킹된 형태로만 나간다. */
  async userList(params: { q?: string; page?: number }): Promise<Paginated<MaskedUser>> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = 20;

    // 검색도 닉네임과 학번까지만. 실명·이메일은 애초에 저장하지 않는다.
    const where = params.q
      ? or(ilike(users.nickname, `%${params.q}%`), ilike(users.studentNo, `%${params.q}%`))
      : undefined;

    const rows = await this.db
      .select()
      .from(users)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(where);

    return {
      items: rows.map((r) => ({
        id: r.id,
        maskedNickname: maskNickname(r.nickname),
        accountType: r.type,
        maskedStudentNo: maskStudentNo(r.studentNo),
        role: r.role,
        lastSeenAt: r.lastSeenAt?.toISOString().slice(0, 16).replace('T', ' ') ?? null,
        state: r.state,
      })),
      total: countRow?.count ?? 0,
      page,
      pageSize,
    };
  }

  /**
   * 마스킹 해제는 즉시 열어 주지 않는다. 요청만 만들고 승인 대기 상태로 둔다.
   * 승인 흐름은 별도 화면에서 처리한다.
   */
  async requestUnmask(
    requesterId: string,
    requesterLabel: string,
    targetUserId: string,
    reason: string,
    ip: string,
  ) {
    const [row] = await this.db
      .insert(unmaskRequests)
      .values({ requesterId, targetUserId, reason })
      .returning();

    await this.audit.record({
      category: 'admin',
      actorId: requesterId,
      actorLabel: requesterLabel,
      action: '개인정보 열람 요청',
      target: targetUserId,
      outcome: 'pending',
      ip,
      meta: { reason },
    });

    return row;
  }

  async lessonList(): Promise<Paginated<Lesson>> {
    const rows = await this.db.select().from(lessons).orderBy(lessons.orderIndex);
    return {
      items: rows as unknown as Lesson[],
      total: rows.length,
      page: 1,
      pageSize: rows.length,
    };
  }

  async createLesson(editorId: string, editorLabel: string, body: Partial<Lesson>, ip: string) {
    const [row] = await this.db
      .insert(lessons)
      .values({
        slug: body.slug ?? `lesson-${Date.now()}`,
        title: body.title ?? '(제목 없음)',
        description: body.description ?? '',
        band: body.band ?? 'e56',
        concept: body.concept ?? 'seq',
        level: body.level ?? 1,
        periods: body.periods ?? 1,
        standardCode: body.standardCode ?? null,
        blockLabels: body.blockLabels ?? [],
        stage: body.stage ?? null,
        status: body.status ?? 'draft',
        orderIndex: body.orderIndex ?? 999,
      })
      .returning();

    if (row) {
      await this.db.insert(lessonRevisions).values({ lessonId: row.id, editorId, snapshot: row });
      await this.audit.record({
        category: 'admin',
        actorId: editorId,
        actorLabel: editorLabel,
        action: '문제 등록',
        target: row.title,
        ip,
      });
    }
    return row;
  }

  async updateLesson(
    editorId: string,
    editorLabel: string,
    id: string,
    body: Partial<Lesson>,
    ip: string,
  ) {
    const [row] = await this.db
      .update(lessons)
      .set({ ...body, updatedAt: new Date() } as never)
      .where(eq(lessons.id, id))
      .returning();
    if (!row) throw new NotFoundException('미션을 찾을 수 없습니다.');

    await this.db.insert(lessonRevisions).values({ lessonId: id, editorId, snapshot: row });
    await this.audit.record({
      category: 'admin',
      actorId: editorId,
      actorLabel: editorLabel,
      action: '문제 수정',
      target: row.title,
      ip,
    });
    return row;
  }

  async inquiryList(): Promise<Inquiry[]> {
    const rows = await this.db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      body: r.body,
      authorMemberNo: r.authorId ?? '알 수 없음',
      createdAt: r.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      state: r.state,
      answer: r.answer,
      answeredAt: r.answeredAt?.toISOString() ?? null,
    }));
  }

  async answerInquiry(adminId: string, adminLabel: string, id: string, answer: string, ip: string) {
    const [row] = await this.db
      .update(inquiries)
      .set({ answer, state: 'answered', answeredById: adminId, answeredAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    if (!row) throw new NotFoundException('문의를 찾을 수 없습니다.');

    await this.audit.record({
      category: 'admin',
      actorId: adminId,
      actorLabel: adminLabel,
      action: '문의 답변 발송',
      target: row.code,
      ip,
    });
    return row;
  }

  async holdInquiry(adminId: string, adminLabel: string, id: string, ip: string) {
    const [row] = await this.db
      .update(inquiries)
      .set({ state: 'held' })
      .where(eq(inquiries.id, id))
      .returning();
    if (!row) throw new NotFoundException('문의를 찾을 수 없습니다.');

    await this.audit.record({
      category: 'admin',
      actorId: adminId,
      actorLabel: adminLabel,
      action: '문의 보류 처리',
      target: row.code,
      ip,
    });
    return row;
  }
}
