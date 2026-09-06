import { expect, test } from '@playwright/test';

import { LESSON, mockApi } from './mock-api';

/**
 * 가입 → 미션 목록 → 미션 풀이 → XP.
 * v0.1 이 "동작한다"고 말할 수 있으려면 이 한 줄기가 끊기지 않아야 한다.
 */
test('가입한 학생이 미션을 열고 실행 결과를 받는다', async ({ page }) => {
  await mockApi(page);

  await page.goto('/signup');
  await page.getByLabel('닉네임').fill('테스트봇');
  await page.getByLabel('비밀번호').fill('coblocks-e2e');
  await page.getByRole('button', { name: '계정 만들기' }).click();

  // 복구 코드는 가입 직후 한 번만 보인다. 확인 체크 전에는 넘어갈 수 없다.
  await expect(page.getByText('AAAA-1111')).toBeVisible();
  const start = page.getByRole('button', { name: '시작하기' });
  await expect(start).toBeDisabled();
  await page.getByRole('checkbox').check();
  await start.click();

  await expect(page.getByRole('heading', { name: /테스트봇님/ })).toBeVisible();

  await page.getByRole('link', { name: '학습하기로 이동' }).click();
  await page.getByRole('button', { name: new RegExp(LESSON.title) }).click();
  await page.getByRole('button', { name: '학습하기' }).click();

  await expect(page).toHaveURL(new RegExp(`/app/learn/${LESSON.slug}$`));
  await expect(page.getByRole('heading', { name: LESSON.title })).toBeVisible();

  // Blockly 는 별도 청크다. 내려받아 붙을 때까지 기다린다.
  // `.blocklyWorkspace` 는 툴박스·플라이아웃에도 붙어서 셋이 잡힌다. 주입 컨테이너는 하나다.
  await expect(page.locator('.injectionDiv')).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: '▶ 실행하기' }).click();
  await expect(page.getByText('+20 XP')).toBeVisible();
});
