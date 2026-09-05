import { randomInt } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { and, eq, isNull } from 'drizzle-orm';

import {
  validateNickname,
  validatePassword,
  type AuthUser,
  type LoginResponse,
  type SignupResponse,
} from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import { recoveryCodes, users } from '../db/schema';

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

/** postgres 의 unique_violation. 닉네임 선점 경합을 500 이 아니라 409 로 돌려주기 위해 본다. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}

/** 발급하는 복구 코드 개수 */
const RECOVERY_CODE_COUNT = 8;
/** 헷갈리는 글자(0/O, 1/I/L)를 뺀 알파벳 */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

type UserRow = typeof users.$inferSelect;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  private toAuthUser(row: UserRow): AuthUser {
    return {
      id: row.id,
      nickname: row.nickname,
      role: row.role,
      accountType: row.type,
      studentNo: row.studentNo,
    };
  }

  private sign(row: UserRow): Promise<string> {
    return this.jwt.signAsync({ sub: row.id, nickname: row.nickname, role: row.role });
  }

  /** XXXX-XXXX 형태. 손으로 옮겨 적을 수 있어야 하므로 짧고 헷갈리는 글자를 뺀다. */
  private newRecoveryCode(): string {
    const pick = (): string => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)] ?? 'A';
    const group = (): string => Array.from({ length: 4 }, pick).join('');
    return `${group()}-${group()}`;
  }

  private async issueRecoveryCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => this.newRecoveryCode());
    const rows = await Promise.all(
      codes.map(async (code) => ({ userId, codeHash: await argon2.hash(code) })),
    );
    await this.db.insert(recoveryCodes).values(rows);
    return codes;
  }

  /**
   * 일반 계정 가입. 닉네임과 비밀번호만 받는다 — 실명·이메일·생년월일을 묻지 않는다.
   * 복구 코드는 이 응답에서만 볼 수 있다.
   */
  async signup(nickname: string, password: string, ip: string): Promise<SignupResponse> {
    const trimmed = nickname.trim();
    // 형식 위반은 400 이고, 닉네임 선점은 409 다. 둘을 같은 코드로 묶으면 화면이 구분하지 못한다.
    const reason = validateNickname(trimmed) ?? validatePassword(password);
    if (reason) throw new BadRequestException(reason);

    // 미리 보는 것은 흔한 경우의 메시지를 좋게 하기 위한 것이고,
    // 진짜 방어는 아래 unique 인덱스다 — 확인과 삽입 사이에 남이 같은 닉네임을 채갈 수 있다.
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.nickname, trimmed))
      .limit(1);
    if (existing) throw new ConflictException('이미 쓰고 있는 닉네임입니다.');

    let row: UserRow | undefined;
    try {
      [row] = await this.db
        .insert(users)
        .values({ nickname: trimmed, passwordHash: await argon2.hash(password), type: 'personal' })
        .returning();
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('이미 쓰고 있는 닉네임입니다.');
      throw error;
    }
    if (!row) throw new InternalServerErrorException('가입에 실패했습니다. 다시 시도해 주세요.');

    const codes = await this.issueRecoveryCodes(row.id);

    await this.audit.record({
      category: 'access',
      actorId: row.id,
      actorLabel: row.nickname,
      action: '일반 계정 가입',
      target: 'web',
      ip,
    });

    return { accessToken: await this.sign(row), user: this.toAuthUser(row), recoveryCodes: codes };
  }

  async login(nickname: string, password: string, ip: string): Promise<LoginResponse> {
    const trimmed = nickname.trim();
    const [row] = await this.db.select().from(users).where(eq(users.nickname, trimmed)).limit(1);

    // 닉네임이 없을 때도 같은 메시지를 준다 — 계정 존재 여부를 흘리지 않기 위해.
    const ok = row ? await verifyPassword(row.passwordHash, password) : false;

    if (!row || !ok) {
      await this.audit.record({
        category: 'access',
        actorLabel: trimmed || '(빈 닉네임)',
        action: '로그인 실패',
        outcome: 'failure',
        ip,
      });
      throw new UnauthorizedException('닉네임 또는 비밀번호를 확인해 주세요.');
    }

    if (row.state === 'suspended') {
      await this.audit.record({
        category: 'access',
        actorId: row.id,
        actorLabel: row.nickname,
        action: '정지 계정 로그인 시도',
        outcome: 'failure',
        ip,
      });
      throw new UnauthorizedException('정지된 계정입니다.');
    }

    await this.db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, row.id));

    await this.audit.record({
      category: 'access',
      actorId: row.id,
      actorLabel: row.nickname,
      action: '로그인 성공',
      target: 'web',
      ip,
    });

    return { accessToken: await this.sign(row), user: this.toAuthUser(row) };
  }

  /**
   * 복구 코드로 비밀번호를 재설정한다.
   * 코드는 한 번만 쓸 수 있고, 성공·실패 모두 감사 로그에 남는다.
   */
  async recover(
    nickname: string,
    code: string,
    newPassword: string,
    ip: string,
  ): Promise<{ ok: true }> {
    const trimmed = nickname.trim();
    const normalized = code.trim().toUpperCase();
    const reason = validatePassword(newPassword);
    if (reason) throw new BadRequestException(reason);

    const [row] = await this.db.select().from(users).where(eq(users.nickname, trimmed)).limit(1);

    const unused = row
      ? await this.db
          .select()
          .from(recoveryCodes)
          .where(and(eq(recoveryCodes.userId, row.id), isNull(recoveryCodes.usedAt)))
      : [];

    // 코드를 순서대로 확인하고 맞으면 곧바로 멈춘다. argon2 검증은 의도적으로 비싼 연산이라
    // 병렬로 전부 돌리면 한 번의 복구 시도가 8회분 CPU 를 쓴다.
    let matched: string | null = null;
    for (const candidate of unused) {
      // oxlint-disable-next-line no-await-in-loop -- 위 주석 참고: 조기 종료가 목적이다
      if (await verifyPassword(candidate.codeHash, normalized)) {
        matched = candidate.id;
        break;
      }
    }

    if (!row || !matched) {
      await this.audit.record({
        category: 'access',
        actorId: row?.id,
        actorLabel: trimmed || '(빈 닉네임)',
        action: '복구 코드 사용 실패',
        outcome: 'failure',
        ip,
      });
      throw new UnauthorizedException('닉네임 또는 복구 코드를 확인해 주세요.');
    }

    await this.db
      .update(users)
      .set({ passwordHash: await argon2.hash(newPassword) })
      .where(eq(users.id, row.id));
    await this.db
      .update(recoveryCodes)
      .set({ usedAt: new Date() })
      .where(eq(recoveryCodes.id, matched));

    await this.audit.record({
      category: 'access',
      actorId: row.id,
      actorLabel: row.nickname,
      action: '복구 코드로 비밀번호 재설정',
      target: 'web',
      ip,
    });

    return { ok: true };
  }
}
