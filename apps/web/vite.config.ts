import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

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
      // shared 는 빌드 산출물이 아니라 TS 소스를 그대로 쓴다.
      // 별칭이 없으면 Vite 가 node_modules 의존성으로 보고 사전 번들링하다 실패한다.
      '@coblocks/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  optimizeDeps: { exclude: ['@coblocks/shared'] },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  },
});
