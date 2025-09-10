import { createRouter } from '@tanstack/react-router';
// @ts-ignore
import { routeTree } from './routeTree.gen.ts';

declare module '@tanstack/react-router' {
  interface RegisterRouter {
    router: typeof router;
  }
}

export const router = createRouter({ routeTree });
