import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IsString, MinLength } from 'class-validator';
import type { AuditCategory, AuthUser, Lesson } from '@coblocks/shared';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { AuditService } from '../common/audit.service';

class UnmaskDto {
  @IsString()
  @MinLength(5, { message: '열람 사유를 5자 이상 적어 주세요.' })
  reason!: string;
}

class AnswerDto {
  @IsString()
  @MinLength(1)
  answer!: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('audit-logs')
  auditLogs(@Query('q') q?: string, @Query('categories') categories?: string, @Query('page') page?: string) {
    return this.admin.auditLogList({
      q,
      categories: categories ? (categories.split(',') as AuditCategory[]) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  @Get('users')
  users(@Query('q') q?: string, @Query('page') page?: string) {
    return this.admin.userList({ q, page: page ? Number(page) : undefined });
  }

  @Post('users/:id/unmask-requests')
  unmask(@CurrentUser() me: AuthUser, @Param('id') id: string, @Body() dto: UnmaskDto, @Req() req: Request) {
    return this.admin.requestUnmask(me.id, me.loginId, id, dto.reason, AuditService.clientIp(req));
  }

  @Get('lessons')
  lessons() {
    return this.admin.lessonList();
  }

  @Post('lessons')
  createLesson(@CurrentUser() me: AuthUser, @Body() body: Partial<Lesson>, @Req() req: Request) {
    return this.admin.createLesson(me.id, me.loginId, body, AuditService.clientIp(req));
  }

  @Patch('lessons/:id')
  updateLesson(
    @CurrentUser() me: AuthUser,
    @Param('id') id: string,
    @Body() body: Partial<Lesson>,
    @Req() req: Request,
  ) {
    return this.admin.updateLesson(me.id, me.loginId, id, body, AuditService.clientIp(req));
  }

  @Get('inquiries')
  inquiries() {
    return this.admin.inquiryList();
  }

  @Post('inquiries/:id/answer')
  answer(@CurrentUser() me: AuthUser, @Param('id') id: string, @Body() dto: AnswerDto, @Req() req: Request) {
    return this.admin.answerInquiry(me.id, me.loginId, id, dto.answer, AuditService.clientIp(req));
  }

  @Post('inquiries/:id/hold')
  hold(@CurrentUser() me: AuthUser, @Param('id') id: string, @Req() req: Request) {
    return this.admin.holdInquiry(me.id, me.loginId, id, AuditService.clientIp(req));
  }
}
