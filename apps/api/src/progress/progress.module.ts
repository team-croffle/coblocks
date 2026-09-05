import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditService } from '../common/audit.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  // 이 모듈의 컨트롤러가 @UseGuards(JwtAuthGuard) 를 쓴다.
  imports: [AuthModule],
  controllers: [ProgressController],
  providers: [ProgressService, AuditService],
})
export class ProgressModule {}
