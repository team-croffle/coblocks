import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { eq } from 'drizzle-orm';
import type { AuthUser } from '@coblocks/shared';
import { DB } from '../db/database.module';
import type { Db } from '../db/client';
import { users } from '../db/schema';

export interface JwtPayload {
  sub: string;
  loginId: string;
  role: AuthUser['role'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(DB) private readonly db: Db) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  /** 토큰이 유효해도 계정이 정지/삭제됐으면 통과시키지 않는다. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const [row] = await this.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!row || row.state === 'suspended') throw new UnauthorizedException();

    return { id: row.id, loginId: row.loginId, displayName: row.name, role: row.role };
  }
}
