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

  build: {
    /**
     * Blockly 만 이 선 가까이 간다(약 708 kB / gzip 194 kB). 코어를 더 줄일 방법이 없다 —
     * 이미 `blockly/core` 만 쓰고 있고, 한국어 로케일을 빼도 628 kB 다.
     * 그래서 경고를 끄는 대신 **Blockly 바로 위**로 올려 둔다. 다른 청크가 이 선에 걸리면
     * 그건 진짜 신호이고, Blockly 가 걸리면 라이브러리가 커졌다는 뜻이다.
     */
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        /**
         * 벤더를 갈라 두면 앱 코드를 배포해도 react·tanstack 캐시가 살아 있다.
         * Blockly 는 이름만 붙인다 — 진입점에서 정적으로 닿지 않으므로 그대로 지연 로드다
         * (빌드 결과의 index.html 에 modulepreload 가 붙지 않는 것으로 확인한다).
         */
        codeSplitting: {
          groups: [
            { name: 'blockly', test: /node_modules[\\/]blockly[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'tanstack', test: /node_modules[\\/]@tanstack[\\/]/ },
          ],
        },
      },
    },
  },
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
