import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['student', 'teacher', 'admin']);
export const accountState = pgEnum('account_state', ['active', 'dormant', 'suspended']);
export const gradeBand = pgEnum('grade_band', ['e34', 'e56', 'm', 'h']);
export const conceptKey = pgEnum('concept_key', [
  'seq',
  'loop',
  'cond',
  'data',
  'func',
  'ds',
  'algo',
  'ai',
]);
export const lessonStatus = pgEnum('lesson_status', ['draft', 'published', 'archived']);
export const progressState = pgEnum('progress_state', ['not_started', 'in_progress', 'completed']);
export const auditCategory = pgEnum('audit_category', ['access', 'activity', 'admin']);
export const auditOutcome = pgEnum('audit_outcome', ['success', 'failure', 'pending']);
export const inquiryState = pgEnum('inquiry_state', ['open', 'in_progress', 'answered', 'held']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    memberNo: text('member_no').notNull(),
    loginId: text('login_id').notNull(),
    passwordHash: text('password_hash').notNull(),
    // 원본 개인정보. 조회 API 는 반드시 마스킹해서 내보낸다(common/masking.ts).
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: userRole('role').notNull().default('student'),
    schoolName: text('school_name'),
    state: accountState('state').notNull().default('active'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    loginIdx: uniqueIndex('users_login_id_idx').on(t.loginId),
    memberIdx: uniqueIndex('users_member_no_idx').on(t.memberNo),
  }),
);

export const standards = pgTable('standards', {
  code: text('code').primaryKey(),
  band: gradeBand('band').notNull(),
  text: text('text').notNull(),
});

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    band: gradeBand('band').notNull(),
    concept: conceptKey('concept').notNull(),
    level: smallint('level').notNull(),
    periods: smallint('periods').notNull(),
    standardCode: text('standard_code').references(() => standards.code),
    blockLabels: jsonb('block_labels').$type<string[]>().notNull().default([]),
    /** StageConfig. null 이면 블록 플레이어 없이 활동으로만 진행한다. */
    stage: jsonb('stage').$type<unknown>(),
    status: lessonStatus('status').notNull().default('draft'),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('lessons_slug_idx').on(t.slug),
    bandIdx: index('lessons_band_concept_idx').on(t.band, t.concept),
  }),
);

/** 문제 수정 이력 — 관리자가 무엇을 바꿨는지 되짚을 수 있어야 한다. */
export const lessonRevisions = pgTable('lesson_revisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  editorId: uuid('editor_id').references(() => users.id),
  snapshot: jsonb('snapshot').$type<unknown>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const progress = pgTable(
  'progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    state: progressState('state').notNull().default('not_started'),
    /** 마지막으로 저장된 BlockProgram */
    program: jsonb('program').$type<unknown>(),
    attempts: integer('attempts').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('progress_user_lesson_idx').on(t.userId, t.lessonId),
  }),
);

/** append-only. UPDATE/DELETE 는 애플리케이션에서 막고, DB 권한으로도 제한할 것. */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    category: auditCategory('category').notNull(),
    actorId: uuid('actor_id').references(() => users.id),
    /** 사용자가 삭제돼도 남도록 회원번호를 문자열로 복제해 둔다. */
    actorLabel: text('actor_label').notNull(),
    action: text('action').notNull(),
    target: text('target').notNull().default(''),
    ip: text('ip').notNull().default(''),
    userAgent: text('user_agent'),
    outcome: auditOutcome('outcome').notNull().default('success'),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
  },
  (t) => ({
    timeIdx: index('audit_logs_occurred_at_idx').on(t.occurredAt),
    catIdx: index('audit_logs_category_idx').on(t.category),
  }),
);

/** 개인정보 마스킹 해제 요청 — 사유와 승인자를 남긴다. */
export const unmaskRequests = pgTable('unmask_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  targetUserId: uuid('target_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => users.id),
  reason: text('reason').notNull(),
  approved: boolean('approved').notNull().default(false),
  approverId: uuid('approver_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  state: inquiryState('state').notNull().default('open'),
  answer: text('answer'),
  answeredById: uuid('answered_by_id').references(() => users.id),
  answeredAt: timestamp('answered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
