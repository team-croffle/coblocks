import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import type { ConceptKey, GradeBand, LessonLevel } from '@coblocks/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LessonsService } from './lessons.service';

/** 쿼리스트링은 'a,b,c' 형태로 온다. */
const split = <T extends string>(value?: string): T[] | undefined =>
  value ? (value.split(',').filter(Boolean) as T[]) : undefined;

@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('bands') bands?: string,
    @Query('concepts') concepts?: string,
    @Query('levels') levels?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.lessons.list({
      q,
      bands: split<GradeBand>(bands),
      concepts: split<ConceptKey>(concepts),
      levels: split(levels)?.map((n) => Number(n) as LessonLevel),
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.lessons.bySlug(slug);
  }
}
