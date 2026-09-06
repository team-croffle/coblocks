import { fileURLToPath, URL } from 'node:url';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // @vitejs/plugin-react v6 부터 Babel 이 빠져서 컴파일러는 별도 플러그인으로 건다.
    // React Compiler 는 Babel 파이프라인에서 반드시 첫 번째로 돌아야 한다.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: { exclude: ['@coblocks/shared'] },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        // 기본 출력은 AggregateError 스택이라 "API 가 안 떠 있다"는 사실이 안 보인다.
        configure: (proxy) => {
          proxy.on('error', (error, req) => {
            const down =
              error.name === 'AggregateError' ||
              (error as NodeJS.ErrnoException).code === 'ECONNREFUSED';
            const reason = down
              ? 'API 가 3000 번에 없습니다 — `pnpm db:up` 후 `pnpm dev:api` (또는 `pnpm dev`)'
              : error.message;
            console.error(`[api-proxy] ${req.url ?? ''} → ${reason}`);
          });
        },
      },
    },
  },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
