import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, AuditService],
})
export class ProgressModule {}
