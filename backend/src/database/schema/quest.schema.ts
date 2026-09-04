import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chapter } from './chapter.schema';

export const quest = pgTable('quest', {
  id: uuid('id').primaryKey().defaultRandom(),
  chapterId: uuid('chapter_id')
    .notNull()
    .references(() => chapter.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: integer('difficulty').notNull().default(1), // 1 ~ 5
  type: text('type').notNull().default('equal'), // 'equal' | 'individual'
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Quest = typeof quest.$inferSelect;
export type NewQuest = typeof quest.$inferInsert;
