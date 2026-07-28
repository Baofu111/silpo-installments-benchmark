import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const shot = (p, n, full=false) => p.screenshot({ path: `screens/${n}.png`, fullPage: full }).then(() => console.log('  shot', n));

// ALLO real product -> full page
async function allo() {
  const page = await ctx.newPage();
  try {
    await page.goto('https://allo.ua/ua/products/mobile/samsung-galaxy-fold-8-ultra-16-1tb-graphite-sm-f976bzknsek.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5500);
    // close chat/app overlays
    for (const s of ['button[aria-label*="close" i]','.chat2desk-widget-close','text=/×/']) { try { const b=page.locator(s).first(); if(await b.count()) await b.click({timeout:1200}); } catch{} }
    await shot(page, 'allo-full', true);
  } catch (e) { console.log('ALLO err', e.message.split('\n')[0]); }
  finally { await page.close(); }
}

// FOXTROT: click a product tile whose text starts with "Смартфон"
async function foxtrot() {
  const page = await ctx.newPage();
  try {
    await page.goto('https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    const link = page.locator('a', { hasText: /^Смартфон\s/i }).first();
    const cnt = await link.count();
    console.log('FOX title links:', cnt);
    if (cnt) {
      const href = await link.getAttribute('href');
      console.log('FOX href:', href);
      await page.goto(href.startsWith('http')?href:('https://www.foxtrot.com.ua'+href), { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5500);
      await shot(page, 'foxtrot-full', true);
    }
  } catch (e) { console.log('FOX err', e.message.split('\n')[0]); }
  finally { await page.close(); }
}

await allo();
await foxtrot();
await browser.close();
