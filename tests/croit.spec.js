const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const num = (s) => parseInt(String(s).replace(/\D/g, ''), 10);

let errors;

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text());
  });
  await page.goto(URL);
  await page.waitForLoadState('load');
});

test.afterEach(() => {
  expect(errors, 'erori JS / console.error').toEqual([]);
});

test('fără overflow orizontal', async ({ page }) => {
  const { sw, iw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }));
  expect(sw).toBeLessThanOrEqual(iw);
});

test('hamburger #hb: vizibil pe mobil, ascuns pe desktop', async ({ page }) => {
  const w = page.viewportSize().width;
  if (w <= 390) await expect(page.locator('#hb')).toBeVisible();
  else await expect(page.locator('#hb')).toBeHidden();
});

test('contorul live #lbs crește în 3 secunde', async ({ page }) => {
  const before = num(await page.locator('#lbs').textContent());
  await page.waitForTimeout(3000);
  const after = num(await page.locator('#lbs').textContent());
  expect(after).toBeGreaterThan(before);
});

test('jocul: 14 împunsături în ordine → #gcd primește „on”', async ({ page }) => {
  for (let i = 0; i <= 13; i++) {
    await page.locator(`#gsv .hole[data-i="${i}"]`).click();
  }
  await expect(page.locator('#gcd')).toHaveClass(/(^|\s)on(\s|$)/);
});

test('coș: drop + Portofel Bifold + IMPUNSATURA10 → 1.989 lei', async ({ page }) => {
  await page.locator('#dgo').click();
  const card = page.locator('article.pi', { hasText: 'Portofel Bifold' });
  await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: 'Adaugă', exact: true }).click();
  await page.locator('#cb').click();
  await page.locator('#pcd').fill('IMPUNSATURA10');
  await page.locator('#pap').click();
  await expect(page.locator('#cft')).toContainText('1.989 lei');
});

test('urmărire: CR-0398 → „Coletul e la curier”', async ({ page }) => {
  await page.locator('.tf .ex button', { hasText: 'CR-0398' }).click();
  await expect(page.locator('#tr')).toContainText('Coletul e la curier');
});
