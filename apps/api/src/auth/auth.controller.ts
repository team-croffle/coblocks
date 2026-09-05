import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';

import type { AuthUser } from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsString()
  @MinLength(1)
  loginId!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly audit: AuditService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto.loginId, dto.password, AuditService.clientIp(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: AuthUser, @Req() req: Request) {
    // JWT 는 서버에 세션이 없으므로 기록만 남긴다.
    // TODO: 리프레시 토큰을 도입하면 여기서 폐기한다.
    await this.audit.record({
      category: 'access',
      actorId: user.id,
      actorLabel: user.loginId,
      action: '로그아웃',
      target: 'web',
      ip: AuditService.clientIp(req),
    });
    return { ok: true };
  }
}
