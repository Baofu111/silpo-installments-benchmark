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
// find element containing "міс" (monthly) to locate credit entry
const info = await page.evaluate(() => {
  const rx = /міс|Кредит|розстроч|частин/i;
  let best=null;
  document.querySelectorAll('a,button,[role=button],div,span,p').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(t && t.length<40 && /міс/i.test(t) && /\d/.test(t)){
      const r=el.getBoundingClientRect();
      if(r.width>0&&r.height>0){ const y=r.top+window.scrollY; if(!best||y<best.y) best={t:t.replace(/\s+/g,' '),y:Math.round(y),tag:el.tagName};}
    }
  });
  return best;
});
console.log('monthly entry:', JSON.stringify(info));
const y = info ? Math.max(0, info.y - 260) : 2700;
await page.evaluate((yy)=>window.scrollTo(0,yy), y);
await page.waitForTimeout(1500);
await shot(page, 'allo-price-region');
// try clicking the monthly element
if (info) {
  try {
    const el = page.locator(`${info.tag.toLowerCase()}:has-text("міс")`).first();
    await el.click({ timeout: 5000 }); await page.waitForTimeout(3500);
    await shot(page, 'allo-credit-modal');
  } catch(e){ console.log('click err', e.message.split('\n')[0]); }
}
await browser.close();
