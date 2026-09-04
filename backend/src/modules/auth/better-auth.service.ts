import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { IncomingMessage, ServerResponse } from 'node:http';
import { BetterAuthInstance, createBetterAuth } from './better-auth.config';
import { DB_CONNECTION, type DrizzleDB } from '@/database/drizzle.provider';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  private _auth: BetterAuthInstance;
  private _handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;

  constructor(@Inject(DB_CONNECTION) private readonly db: DrizzleDB) {
    this._auth = createBetterAuth(this.db);
    this._handler = toNodeHandler(this._auth) as (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<void>;
  }

  onModuleInit() {
    this._auth = createBetterAuth(this.db);
    this._handler = toNodeHandler(this._auth) as (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<void>;
  }

  get auth(): BetterAuthInstance {
    return this._auth;
  }

  get handler() {
    return this._handler;
  }
}
