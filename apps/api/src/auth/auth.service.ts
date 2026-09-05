import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

import type { AuthUser, LoginResponse } from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import { users } from '../db/schema';

/**
 * 해시 형식이 깨져 있으면 argon2 가 예외를 던진다.
 * 그 경우도 "비밀번호 불일치"와 똑같이 처리해야 계정 상태가 밖으로 새지 않는다.
 */
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(loginId: string, password: string, ip: string): Promise<LoginResponse> {
    const [row] = await this.db.select().from(users).where(eq(users.loginId, loginId)).limit(1);

    // 아이디가 없을 때도 같은 메시지를 준다 — 계정 존재 여부를 흘리지 않기 위해.
    const ok = row ? await verifyPassword(row.passwordHash, password) : false;

    if (!row || !ok) {
      await this.audit.record({
        category: 'access',
        actorLabel: loginId || '(빈 아이디)',
        action: '로그인 실패',
        outcome: 'failure',
        ip,
      });
      throw new UnauthorizedException('아이디 또는 비밀번호를 확인해 주세요.');
    }

    if (row.state === 'suspended') {
      await this.audit.record({
        category: 'access',
        actorId: row.id,
        actorLabel: row.memberNo,
        action: '정지 계정 로그인 시도',
        outcome: 'failure',
        ip,
      });
      throw new UnauthorizedException('정지된 계정입니다.');
    }

    await this.db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, row.id));

    const user: AuthUser = {
      id: row.id,
      loginId: row.loginId,
      displayName: row.name,
      role: row.role,
    };
    const accessToken = await this.jwt.signAsync({
      sub: row.id,
      loginId: row.loginId,
      role: row.role,
    });

    await this.audit.record({
      category: 'access',
      actorId: row.id,
      actorLabel: row.memberNo,
      action: '로그인 성공',
      target: 'web',
      ip,
    });

    return { accessToken, user };
  }
}
