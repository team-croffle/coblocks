import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { databaseProvider, DB_CONNECTION } from './drizzle.provider';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as path from 'path';

@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DbModule implements OnModuleInit {
  constructor(@Inject(DB_CONNECTION) private readonly db: NodePgDatabase<any>) {}

  async onModuleInit() {
    console.log('Running database migrations...');
    await migrate(this.db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    console.log('Database migrations completed successfully.');
  }
}
