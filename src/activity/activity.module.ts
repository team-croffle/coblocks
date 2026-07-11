import { Module } from '@nestjs/common';
import { ActivityGateway } from './activity.gateway';
import { ActivityService } from './activity.service';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { ManagerGuard } from 'src/auth/manager/manager.guard';
import { ActivityStateService } from './activity-state.service';

@Module({
  imports: [ClassroomModule],
  providers: [ActivityGateway, ActivityService, ManagerGuard, ActivityStateService],
  exports: [ActivityService, ActivityStateService],
})
export class ActivityModule {}
