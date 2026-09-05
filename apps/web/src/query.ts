import { QueryClient } from '@tanstack/react-query';

/**
 * 쿼리 클라이언트를 모듈로 빼 둔다.
 * main.tsx 안에서 만들면 router.tsx 가 그 인스턴스를 볼 수 없어 loader 에서 프리페치를 걸 수 없다.
 */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
