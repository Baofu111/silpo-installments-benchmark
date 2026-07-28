import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const shot = (p, n) => p.screenshot({ path: `screens/${n}.png` }).then(() => console.log('  shot', n));
const page = await ctx.newPage();
await page.goto('https://allo.ua/ua/products/mobile/samsung-galaxy-fold-8-ultra-16-1tb-graphite-sm-f976bzknsek.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(5500);
const btn = page.locator('text=/Кредит\\s+(з|із)\\s*\\d+/i').first();
console.log('credit btn count:', await btn.count());
if (await btn.count()) {
  await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  await shot(page, 'allo-credit-inline');
  try {
    await btn.click({ timeout: 6000 }); await page.waitForTimeout(3500);
    await shot(page, 'allo-credit-modal');
    await page.mouse.wheel(0, 350); await page.waitForTimeout(1000);
    await shot(page, 'allo-credit-modal2');
  } catch(e){ console.log('click err', e.message.split('\n')[0]); }
}
await browser.close();
