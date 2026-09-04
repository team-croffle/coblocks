import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'postgres://coblocks:coblocks@localhost:5432/coblocks';

export const queryClient = postgres(url, { max: 10 });
export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
export { schema };
