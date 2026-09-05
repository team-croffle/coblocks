import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditService } from '../common/audit.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  // 이 모듈의 컨트롤러가 @UseGuards(JwtAuthGuard) 를 쓴다.
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService],
})
export class AdminModule {}
