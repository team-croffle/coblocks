import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { BetterAuthService } from './better-auth.service';
import { BetterAuthController } from './better-auth.controller';

@Module({
  imports: [PassportModule],
  controllers: [BetterAuthController],
  providers: [JwtStrategy, JwtAuthGuard, BetterAuthService],
  exports: [JwtAuthGuard, BetterAuthService],
})
export class AuthModule {}
