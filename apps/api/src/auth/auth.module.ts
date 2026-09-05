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
    // 맨몸 PassportModule 은 @Module({}) 라 아무것도 제공하지 않는다.
    // register() 를 거쳐야 AuthGuard 가 주입받는 AuthModuleOptions 가 생긴다.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditService],
  // JwtAuthGuard 는 AuthGuard('jwt') 상속이라 AuthModuleOptions 주입이 필요하다.
  // 가드를 쓰는 모듈이 AuthModule 만 import 하면 되도록 PassportModule 을 함께 내보낸다.
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
