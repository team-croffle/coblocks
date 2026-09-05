import { expect, test } from '@playwright/test';

import { LESSON, mockApi } from './mock-api';

/**
 * v0.1.0-06 의 완료 기준을 그대로 옮긴 검사다.
 * 예전에는 시드 데이터가 깔려 있어 API 가 죽어도 화면이 멀쩡해 보였다.
 * 이제는 못 불러오면 못 불러왔다고 말해야 한다.
 */
test('미션 목록을 못 불러오면 에러와 재시도를 보여준다', async ({ page }) => {
  await mockApi(page, { fail: ['/lessons'] });
  await page.addInitScript(() => localStorage.setItem('coblocks.token', 'e2e-token'));

  await page.goto('/app/curriculum');

  await expect(page.getByText('미션 목록을(를) 불러오지 못했습니다.')).toBeVisible();
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible();
  await expect(page.getByRole('button', { name: new RegExp(LESSON.title) })).toHaveCount(0);
});

test('재시도가 성공하면 목록이 채워진다', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('coblocks.token', 'e2e-token'));

  let broken = true;
  await mockApi(page);
  // mockApi 보다 먼저 걸리도록 나중에 등록한다 — Playwright 는 마지막 라우트를 먼저 본다.
  await page.route('**/api/lessons*', async (route) => {
    if (!broken) return route.fallback();
    return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/app/curriculum');
  await expect(page.getByText('미션 목록을(를) 불러오지 못했습니다.')).toBeVisible();

  broken = false;
  await page.getByRole('button', { name: '다시 시도' }).click();
  await expect(page.getByRole('button', { name: new RegExp(LESSON.title) })).toBeVisible();
});
