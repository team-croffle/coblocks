import './styles/main.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ToastHost } from './components/ToastHost';
import { queryClient } from './query';
import { router } from './router';
import { authReady } from './stores/auth';

// 첫 렌더 전에 세션 복원을 시작한다. 기다리지는 않는다 —
// 복원이 필요한 라우트의 가드가 `waitForAuth` 로 같은 약속을 기다린다.
void authReady();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('#root 엘리먼트를 찾지 못했습니다. index.html 을 확인하세요.');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastHost />
    </QueryClientProvider>
  </StrictMode>,
);
