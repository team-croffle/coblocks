import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthUser } from '@coblocks/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
