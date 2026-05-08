import { test, expect } from '@playwright/test'
import { resetDb, seedMatchingJob, getLatestSenior } from './helpers/db'

// 사전 조건: 서울 / 경비/보안 / 요구경력 3년 공고 1건
// 시니어 경력 5년 → score_region 3 + score_job 2 + score_career 1 = 6점
test.beforeEach(async () => {
  await resetDb()
  await seedMatchingJob()
})

test('TC-01: 시니어 등록 후 6점 금색 배지 추천 표시', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '테스트시니어')
  await page.selectOption('#region', '서울')
  await page.selectOption('#jobType', '경비/보안')
  await page.fill('#career', '5')
  await page.click('button[type="submit"]')

  // 초록 박스 확인
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible({ timeout: 10000 })

  // 방금 생성된 시니어 ID 조회
  const senior = await getLatestSenior()

  await page.goto(`/recommendations?senior_id=${senior.id}`)

  // 6점 금색 배지가 상단에 표시되는지 확인
  await expect(page.locator('text=6점 ★ 매우 적합').first()).toBeVisible({ timeout: 10000 })
})
