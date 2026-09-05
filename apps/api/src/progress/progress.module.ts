import { Module } from '@nestjs/common';

import { AuditService } from '../common/audit.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, AuditService],
})
export class ProgressModule {}
