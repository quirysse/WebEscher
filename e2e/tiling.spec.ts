import { test, expect } from '@playwright/test'

test('selecting a wallpaper group shows the tiling', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'WebEscher' })).toBeVisible()

  await page.getByRole('button', { name: /p4 –/ }).first().click()
  await expect(page.getByText('Tiling view (Phase 2)')).not.toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
})

test('language switch updates UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Éditeur de pavage')).toBeVisible()
  await page.getByRole('button', { name: /EN|FR/ }).click()
  await expect(page.getByText('Escher-inspired plane tiling')).toBeVisible()
})
