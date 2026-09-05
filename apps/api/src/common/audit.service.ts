import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';

import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import { auditLogs } from '../db/schema';

type Category = 'access' | 'activity' | 'admin';
type Outcome = 'success' | 'failure' | 'pending';

export interface AuditInput {
  category: Category;
  actorId?: string | null;
  actorLabel: string;
  action: string;
  target?: string;
  outcome?: Outcome;
  ip?: string;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@Inject(DB) private readonly db: Db) {}

  /** 감사 로그 기록은 실패해도 본 요청을 막지 않는다. 대신 반드시 남긴다. */
  async record(input: AuditInput): Promise<void> {
    try {
      await this.db.insert(auditLogs).values({
        category: input.category,
        actorId: input.actorId ?? null,
        actorLabel: input.actorLabel,
        action: input.action,
        target: input.target ?? '',
        outcome: input.outcome ?? 'success',
        ip: input.ip ?? '',
        userAgent: input.userAgent ?? null,
        meta: input.meta ?? null,
      });
    } catch (error) {
      this.logger.error(`감사 로그 기록 실패: ${input.action}`, error as Error);
    }
  }

  static clientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? '';
    return req.ip ?? '';
  }
}
