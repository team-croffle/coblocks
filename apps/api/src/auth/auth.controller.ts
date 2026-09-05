import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';

import { PASSWORD_MIN, type AuthUser } from '@coblocks/shared';

import { AuditService } from '../common/audit.service';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsString()
  @MinLength(1)
  nickname!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

class SignupDto {
  @IsString()
  @MinLength(1)
  nickname!: string;

  @IsString()
  @MinLength(PASSWORD_MIN)
  password!: string;
}

class RecoverDto {
  @IsString()
  @MinLength(1)
  nickname!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(PASSWORD_MIN)
  newPassword!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly audit: AuditService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto, @Req() req: Request) {
    return this.auth.signup(dto.nickname, dto.password, AuditService.clientIp(req));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto.nickname, dto.password, AuditService.clientIp(req));
  }

  @Post('recover')
  recover(@Body() dto: RecoverDto, @Req() req: Request) {
    return this.auth.recover(dto.nickname, dto.code, dto.newPassword, AuditService.clientIp(req));
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
      actorLabel: user.nickname,
      action: '로그아웃',
      target: 'web',
      ip: AuditService.clientIp(req),
    });
    return { ok: true };
  }
}
