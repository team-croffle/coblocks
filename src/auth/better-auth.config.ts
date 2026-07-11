import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from 'src/database/schema';

/**
 * Better Auth 인스턴스 팩토리.
 * DrizzleService가 초기화된 뒤에 호출되어야 하므로 팩토리 함수 형태로 작성.
 *
 * - emailAndPassword: 이메일/비밀번호 로그인/회원가입
 * - jwt plugin: /api/auth/token 엔드포인트 및 JWKS(/api/auth/jwks) 제공
 * - additionalFields: nickname, role 커스텀 필드
 */
export function createBetterAuth(db: PostgresJsDatabase<typeof schema>) {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        ...schema,
        // Better Auth는 단수형 모델명(user, session, ...)을 사용
        // usePlural 대신 명시적으로 매핑
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [jwt()],
    user: {
      additionalFields: {
        nickname: {
          type: 'string',
          required: false,
        },
        role: {
          type: 'string',
          required: false,
          defaultValue: 'student',
        },
      },
    },
    advanced: {
      // UUID 형식의 ID 생성 (DB 스키마 일관성 유지)
      generateId: () => crypto.randomUUID(),
    },
  });
}

export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
