import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BetterAuthService } from './better-auth.service';

/**
 * Better Auth HTTP 핸들러.
 * /api/auth/* 로 들어오는 모든 요청을 Better Auth 인스턴스에 위임.
 *
 * 제공 엔드포인트 (주요):
 *   POST /api/auth/sign-up/email     — 회원가입
 *   POST /api/auth/sign-in/email     — 로그인
 *   POST /api/auth/sign-out          — 로그아웃
 *   GET  /api/auth/token             — JWT 발급 (jwt 플러그인)
 *   GET  /api/auth/jwks              — JWKS 공개키 (jwt 플러그인)
 */
@Controller('api/auth')
export class BetterAuthController {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  @All('*')
  async handler(@Req() req: Request, @Res() res: Response) {
    return this.betterAuthService.handler(req as unknown as any, res as unknown as any);
  }
}
