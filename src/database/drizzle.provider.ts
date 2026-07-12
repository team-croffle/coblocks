import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB_CONNECTION = 'DB_CONNECTION';

export const databaseProvider: Provider = {
  provide: DB_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const dbHost = configService.getOrThrow<string>('DB_HOST');
    const dbPort = configService.getOrThrow<number>('DB_PORT');
    const dbUser = configService.getOrThrow<string>('DB_USER');
    const dbPassword = configService.getOrThrow<string>('DB_PASSWORD');
    const dbName = configService.getOrThrow<string>('DB_DATABASE');

    const pool = new Pool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      max: 20,
    });

    try {
      await pool.query('SELECT 1');
      Logger.log('Successfully connected to the database', 'DrizzleModule');
    } catch (error) {
      Logger.error('Database connection failed on startup', error, 'DrizzleModule');
      throw error;
    }

    // Drizzle 인스턴스 생성 및 스키마 주입
    return drizzle(pool, { schema });
  },
};
