import { Injectable, OnModuleInit } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { IncomingMessage, ServerResponse } from 'node:http';
import { DrizzleService } from 'src/database/drizzle.service';
import { BetterAuthInstance, createBetterAuth } from './better-auth.config';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  private _auth: BetterAuthInstance;
  private _handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;

  constructor(private readonly drizzleService: DrizzleService) {}

  onModuleInit() {
    this._auth = createBetterAuth(this.drizzleService.db);
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
