import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const shot = (p, n) => p.screenshot({ path: `screens/${n}.png` }).then(() => console.log('  shot', n));

async function allo() {
  const page = await ctx.newPage();
  try {
    await page.goto('https://allo.ua/ua/products/mobile/samsung-galaxy-fold-8-ultra-16-1tb-graphite-sm-f976bzknsek.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5500);
    const cands = await page.evaluate(() => {
      const rx = /части|розстрочк|розтермінув/i;
      const res = [];
      document.querySelectorAll('button, a, [role="button"], span, div').forEach((el) => {
        const t = (el.textContent || '').trim();
        if (t && t.length < 45 && rx.test(t) && el.children.length <= 1) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) res.push({ t: t.replace(/\s+/g,' '), y: Math.round(r.top + window.scrollY), tag: el.tagName.toLowerCase() });
        }
      });
      return res.sort((a,b)=>a.y-b.y);
    });
    console.log('ALLO cands:', JSON.stringify(cands.slice(0,10)));
    const top = cands.find(c => c.y < 2500);
    if (top) {
      const el = page.locator(`${top.tag}:has-text("${top.t}")`).first();
      await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
      await shot(page, 'allo-widget-inline');
      await el.click({ timeout: 5000 }); await page.waitForTimeout(3500);
      await shot(page, 'allo-widget-modal');
    }
  } catch (e) { console.log('ALLO err', e.message.split('\n')[0]); }
  finally { await page.close(); }
}

async function foxtrot() {
  const page = await ctx.newPage();
  try {
    await page.goto('https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    // collect product hrefs, exclude category-like
    const href = await page.evaluate(() => {
      const bad = /(mobilni_telefoni|smartfon|_telefony|catalog|shop$)/i;
      const links = [...document.querySelectorAll('a[href*=".html"]')].map(a=>a.href);
      // product pages usually contain brand+model tokens and digits
      return links.find(h => /\/shop\/[a-z0-9_\-]+\.html/i.test(h) && /(apple_iphone|samsung_galaxy|xiaomi|realme|motorola|oppo|_gb|smartfon_)/i.test(h) && !/^.*mobilni_telefoni\.html$/i.test(h)) || null;
    });
    console.log('FOX href:', href);
    if (href) {
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5500);
      await shot(page, 'foxtrot-product-real2');
      const cands = await page.evaluate(() => {
        const rx = /Оплата частинами|розстрочк|розтермінув|частинами/i;
        const res = [];
        document.querySelectorAll('button, a, [role="button"], span, div').forEach((el) => {
          const t = (el.textContent || '').trim();
          if (t && t.length < 45 && rx.test(t) && el.children.length <= 1) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) res.push({ t: t.replace(/\s+/g,' '), y: Math.round(r.top + window.scrollY), tag: el.tagName.toLowerCase() });
          }
        });
        return res.sort((a,b)=>a.y-b.y);
      });
      console.log('FOX cands:', JSON.stringify(cands.slice(0,10)));
      const top = cands.find(c => c.y < 3500);
      if (top) {
        const el = page.locator(`${top.tag}:has-text("${top.t}")`).first();
        await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
        await shot(page, 'foxtrot-widget-inline');
        await el.click({ timeout: 5000 }); await page.waitForTimeout(3500);
        await shot(page, 'foxtrot-widget-modal');
      }
    }
  } catch (e) { console.log('FOX err', e.message.split('\n')[0]); }
  finally { await page.close(); }
}

await allo();
await foxtrot();
await browser.close();
