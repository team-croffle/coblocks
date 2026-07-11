import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Better Auth 호환 users 테이블.
 * id: Better Auth가 text 타입 ID를 사용 (advanced.generateId로 UUID 형식 생성).
 * name, emailVerified, image: Better Auth 필수 필드.
 * nickname, role: additionalFields로 등록한 커스텀 필드.
 * password는 accounts 테이블에서 관리 (Better Auth 표준).
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  nickname: text('nickname'),
  role: text('role').notNull().default('student'), // 'student' | 'teacher' | 'admin'
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
