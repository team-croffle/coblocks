import { integer, jsonb, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { quest } from './quest.schema';

/**
 * quest_sequence: 퀘스트 정답 절차 시퀀스
 *
 * partNumber: 플레이어 번호 (1~4)
 * stepNumber: 해당 파트 내 단계 순서
 * content:    해당 단계의 블록 배치 스냅샷 또는 정답 조건
 */
export const questSequence = pgTable(
  'quest_sequence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questId: uuid('quest_id')
      .notNull()
      .references(() => quest.id, { onDelete: 'cascade' }),
    partNumber: integer('part_number').notNull(), // 1 ~ 4
    stepNumber: integer('step_number').notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.questId, t.partNumber, t.stepNumber)],
);

export type QuestSequence = typeof questSequence.$inferSelect;
export type NewQuestSequence = typeof questSequence.$inferInsert;
