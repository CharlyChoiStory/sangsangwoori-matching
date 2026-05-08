import { test, expect } from '@playwright/test'
import { resetDb, getSeniorsCount } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
})

test('TC-02: 이름 미입력 시 빨간 안내 박스 표시 및 DB 미삽입', async ({ page }) => {
  const countBefore = await getSeniorsCount()

  await page.goto('/register')
  // 이름 비움 → 나머지만 입력
  await page.selectOption('#region', '서울')
  await page.selectOption('#jobType', '경비/보안')
  await page.fill('#career', '3')
  await page.click('button[type="submit"]')

  // 빨간 안내 박스 표시 확인
  await expect(
    page.locator('text=이름, 지역, 희망 직종은 반드시 입력해야 합니다')
  ).toBeVisible()

  // seniors 테이블에 새 레코드가 들어가지 않음
  const countAfter = await getSeniorsCount()
  expect(countAfter).toBe(countBefore)
})
