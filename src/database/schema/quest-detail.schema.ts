import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { quest } from './quest.schema';

/**
 * quest_detail: 퀘스트 세부 내용 (Blockly 데이터)
 *
 * question: equal 타입이면 string, individual이면 { player1, player2, ... }
 * context:  { is_equal, player1?, player2?, player3?, player4? } — 각 player는 { blocks[] }
 * defaultStage: { col, row, tiles[], objects[], players[] }
 */
export const questDetail = pgTable('quest_detail', {
  id: uuid('id').primaryKey().defaultRandom(),
  questId: uuid('quest_id')
    .notNull()
    .unique()
    .references(() => quest.id, { onDelete: 'cascade' }),
  question: jsonb('question').notNull(),
  context: jsonb('context').notNull(),
  hint: text('hint'),
  answer: text('answer'),
  defaultStage: jsonb('default_stage').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type QuestDetail = typeof questDetail.$inferSelect;
export type NewQuestDetail = typeof questDetail.$inferInsert;
