import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('financial viability tool handles working capital and HTML report on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/toolkit/basabas');

  await page.getByLabel('Biznes növü').selectOption('hotel');
  await expect(page.getByText('Dövriyyə kapitalı', { exact: true })).toBeVisible();
  await expect(page.getByText('Lazım olan dövriyyə kapitalı', { exact: true })).toBeVisible();
  await expect(page.getByText('Otel / qonaqlama')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);

  await page.screenshot({ path: 'C:/tmp/financial-viability-mobile.png', fullPage: true });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML hesabatı endir' }).click();
  const download = await downloadPromise;
  const reportPath = 'C:/tmp/dk-financial-report-hotel.html';
  await download.saveAs(reportPath);
  const report = readFileSync(reportPath, 'utf8');
  expect(report).toContain('name="viewport"');
  expect(report).toContain('Otel / qonaqlama');
  expect(report).toContain('Stok maliyyəsi');

  await page.getByLabel('Hazırkı satış (₼)').fill('0');
  await expect(page.getByText(/Etibarlı hesabat üçün/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'HTML hesabatı endir' })).toBeDisabled();
});

