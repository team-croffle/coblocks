import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';

import type { Lesson, LessonQuery, LessonSummary, Paginated } from '@coblocks/shared';

import type { Db } from '../db/client';
import { DB } from '../db/database.module';
import { lessons } from '../db/schema';

@Injectable()
export class LessonsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async list(query: LessonQuery): Promise<Paginated<LessonSummary>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 50));

    const filters: SQL[] = [eq(lessons.status, query.status ?? 'published')];
    if (query.bands?.length) filters.push(inArray(lessons.band, query.bands));
    if (query.concepts?.length) filters.push(inArray(lessons.concept, query.concepts));
    if (query.levels?.length) filters.push(inArray(lessons.level, query.levels));
    if (query.q) {
      const like = `%${query.q}%`;
      const search = or(
        ilike(lessons.title, like),
        ilike(lessons.description, like),
        ilike(lessons.standardCode, like),
      );
      if (search) filters.push(search);
    }

    const where = and(...filters);

    const rows = await this.db
      .select()
      .from(lessons)
      .where(where)
      .orderBy(asc(lessons.orderIndex))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(lessons)
      .where(where);

    return {
      items: rows as unknown as LessonSummary[],
      total: countRow?.count ?? 0,
      page,
      pageSize,
    };
  }

  async bySlug(slug: string): Promise<Lesson> {
    const [row] = await this.db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
    if (!row) throw new NotFoundException('미션을 찾을 수 없습니다.');
    return row as unknown as Lesson;
  }
}
