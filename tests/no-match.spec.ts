import { test, expect } from '@playwright/test'
import { resetDb, seedNoMatchJob, getLatestSenior } from './helpers/db'

// 사전 조건: 기타/기타/required_career 0 공고만 1건
// 시니어 서울/경비/보안/3 → score_region 0 + score_job 0 + score_career 1 = 1점
// UI 필터: score >= 2 인 것만 표시 → 매칭 없음
test.beforeEach(async () => {
  await resetDb()
  await seedNoMatchJob()
})

test('TC-03: 조건 불일치 시 "현재 매칭되는 일자리가 없습니다" 안내 표시', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '비매칭시니어')
  await page.selectOption('#region', '서울')
  await page.selectOption('#jobType', '경비/보안')
  await page.fill('#career', '3')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible({ timeout: 10000 })

  const senior = await getLatestSenior()
  await page.goto(`/recommendations?senior_id=${senior.id}`)

  await expect(
    page.locator('text=현재 매칭되는 일자리가 없습니다')
  ).toBeVisible({ timeout: 10000 })
})
