import { test, expect } from '@playwright/test';

test('TC-03: Edge Scenario - No match message', async ({ page }) => {
  // We need a senior with no matches. 
  // We'll register a senior with a region/job that has no match.
  
  await page.goto('/register');
  
  await page.fill('#name', '비매칭시니어');
  await page.selectOption('#region', '부산');
  await page.selectOption('#jobType', '교육/상담');
  await page.fill('#career', '0');
  
  await page.click('button:text("등록하기")');
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible();

  // Go to admin and find the senior
  await page.goto('/admin');
  await page.waitForSelector('text=비매칭시니어', { timeout: 10000 });
  await page.click('tr:has-text("비매칭시니어") >> text=상세 보기');
  await page.waitForLoadState('networkidle');
  
  // Expect "no match" message - use a more flexible locator
  await expect(page.locator('text=현재 매칭되는 일자리가 없습니다')).toBeVisible();
});
