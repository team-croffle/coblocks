import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuditService } from '../common/audit.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// expiresIn 은 ms 패키지의 '8h' 같은 리터럴 유니온이라 환경변수 문자열을 그대로 못 받는다.
// 값이 올바른지는 런타임에서 jsonwebtoken 이 판단하고, 여기서는 타입만 맞춰 준다.
const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as JwtSignOptions['expiresIn'];

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditService],
  exports: [AuthService],
})
export class AuthModule {}
