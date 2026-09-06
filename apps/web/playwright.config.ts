import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * E2E 는 빌드 결과물(`vite preview`)을 상대로 돈다.
 * **`vite preview` 는 빌드를 하지 않고 `dist/` 를 그대로 서빙한다.** 그래서 `e2e` 스크립트가
 * 먼저 빌드한다 — 안 그러면 고친 코드가 아니라 지난번 번들을 시험하게 되고, 그건 통과하든
 * 실패하든 아무 뜻이 없다.
 * 개발 서버는 `/api` 를 백엔드로 프록시하지만 preview 는 그러지 않는다.
 * 그래서 이 뼈대는 API 를 `page.route` 로 가로채 계약(요청/응답 모양)만 검증한다.
 * DB 까지 띄우는 진짜 통합 E2E 는 v0.2 에서 붙인다 — 그때는 이 설정에 webServer 를 하나 더 건다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${String(PORT)}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // 빌드는 `e2e` 스크립트가 이미 했다. 여기서는 서빙만 한다.
    command: `pnpm preview --port ${String(PORT)} --strictPort`,
    url: `http://127.0.0.1:${String(PORT)}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
