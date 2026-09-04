import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { quest } from './quest.schema';
import { classroom } from './classroom.schema';

/**
 * store_quest: 사용자별 퀘스트 풀이 기록
 *
 * solveStatus:
 *   0 = 미완료
 *   1 = 완료
 *   2 = 정답
 *   3 = 오답
 *
 * classroomId: NULL이면 개인 풀이, 값이 있으면 강의실 세션에서 풀이
 * submissionContent: 제출한 블록 배치 (JSON)
 */
export const storeQuest = pgTable('store_quest', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id') // Better Auth users.id는 text 타입
    .notNull()
    .references(() => users.id),
  questId: uuid('quest_id')
    .notNull()
    .references(() => quest.id),
  classroomId: uuid('classroom_id').references(() => classroom.id), // nullable
  partNumber: integer('part_number'), // nullable, 1 ~ 4
  solveStatus: integer('solve_status').notNull().default(0),
  submissionContent: jsonb('submission_content'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type StoreQuest = typeof storeQuest.$inferSelect;
export type NewStoreQuest = typeof storeQuest.$inferInsert;
