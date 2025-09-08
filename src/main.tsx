import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';

// React Router
import { router } from './router.ts';
import { RouterProvider } from '@tanstack/react-router';

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}