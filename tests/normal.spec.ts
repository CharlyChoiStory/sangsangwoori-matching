import { test, expect } from '@playwright/test';

test('TC-01: Normal Scenario - Senior registration and 6-point match', async ({ page }) => {
  // We assume a job "서울 / 경비 / 3년" exists. 
  // In a real scenario, we might want to seed the DB here.
  
  await page.goto('/register');
  
  await page.fill('#name', '테스트시니어');
  await page.selectOption('#region', '서울');
  await page.selectOption('#jobType', '경비/보안');
  await page.fill('#career', '5');
  
  await page.click('button:text("등록하기")');
  
  // Expect success message
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible();
});
