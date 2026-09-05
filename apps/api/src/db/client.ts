import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'postgres://coblocks:coblocks@localhost:5432/coblocks';

export const queryClient = postgres(url, { max: 10 });
export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
/** `db.transaction` 콜백이 받는 핸들. 트랜잭션 안에서만 도는 함수의 인자 타입으로 쓴다. */
export type DbTransaction = Parameters<Parameters<Db['transaction']>[0]>[0];
export { schema };
