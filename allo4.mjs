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
const btn = page.locator('button:has-text("міс")').first();
await btn.click({ timeout: 6000 }); await page.waitForTimeout(3000);
// scroll within the modal dialog
const dlg = page.locator('[class*="modal"], [role=dialog], [class*="popup"]').first();
for (let i=1;i<=3;i++){
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await shot(page, `allo-modal-scroll${i}`);
}
// open payment-count dropdown on first card
try {
  const dd = page.locator('text=/\\d+\\s*платеж/i').first();
  await dd.scrollIntoViewIfNeeded();
  await dd.click({ timeout: 4000 }); await page.waitForTimeout(1500);
  await shot(page, 'allo-payments-open');
} catch(e){ console.log('dd err', e.message.split('\n')[0]); }
await browser.close();
