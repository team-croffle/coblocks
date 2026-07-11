import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * classroom: 강의실 세션 이력
 *
 * 실시간 상태(participants, state, grace_period 등)는 Redis에서 관리.
 * DB에는 세션 시작/종료 메타데이터만 기록.
 */
export const classroom = pgTable('classroom', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  managerId: uuid('manager_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }), // NULL = 진행 중
});

export type Classroom = typeof classroom.$inferSelect;
export type NewClassroom = typeof classroom.$inferInsert;
