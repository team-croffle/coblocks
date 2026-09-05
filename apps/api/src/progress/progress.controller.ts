import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthUser, BlockProgram } from '@coblocks/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../common/audit.service';
import { CurrentUser } from '../common/current-user.decorator';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.progress.mine(user.id);
  }

  @Post(':lessonId/attempt')
  attempt(
    @CurrentUser() user: AuthUser,
    @Param('lessonId') lessonId: string,
    @Body('program') program: BlockProgram,
    // 에디터 워크스페이스는 화면 복원용으로 그대로 보관한다. 채점에는 쓰지 않는다.
    @Body('workspace') workspace: unknown,
    @Req() req: Request,
  ) {
    return this.progress.attempt(
      { id: user.id, label: user.nickname },
      lessonId,
      program ?? [],
      workspace ?? null,
      AuditService.clientIp(req),
    );
  }
}
