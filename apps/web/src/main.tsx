import './styles/main.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { router } from './router';
import { useAuthStore } from './stores/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

// 라우터 가드가 사용자 상태를 읽으므로 첫 렌더 전에 세션 복원을 시작한다.
void useAuthStore.getState().restore();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('#root 엘리먼트를 찾지 못했습니다. index.html 을 확인하세요.');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
