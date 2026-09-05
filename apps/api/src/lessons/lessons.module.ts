import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  // 이 모듈의 컨트롤러가 @UseGuards(JwtAuthGuard) 를 쓴다.
  imports: [AuthModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
