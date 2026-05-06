import { test, expect } from '@playwright/test';

test('TC-02: Invalid Scenario - Name field is required', async ({ page }) => {
  await page.goto('/register');
  
  // Fill everything except name
  await page.selectOption('#region', '서울');
  await page.selectOption('#jobType', '경비/보안');
  await page.fill('#career', '3');
  
  await page.click('button:text("등록하기")');
  
  // Expect error message
  await expect(page.locator('text=이름, 지역, 희망 직종은 반드시 입력해야 합니다')).toBeVisible();
});
