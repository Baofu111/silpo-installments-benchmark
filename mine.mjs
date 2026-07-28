import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const shot = (p, n) => p.screenshot({ path: `screens/${n}.png` }).then(() => console.log('  shot', n));

// ===== MOYO deep dive =====
{
  const page = await ctx.newPage();
  await page.goto('https://www.moyo.ua/ua/noutbuk_asus_tuf_gaming_a15_fa506ncq-hn065_90nr0qe7-m003k0/734732.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  const trig = page.locator('text=/Кредит або частинами/i').first();
  if (await trig.count()) { await trig.scrollIntoViewIfNeeded(); await trig.click({ timeout: 5000 }); await page.waitForTimeout(3000); }
  await shot(page, 'moyo-m-1-default');
  // click "Кредит, %" tab
  const creditTab = page.locator('text=/^\\s*Кредит,\\s*%/i').first();
  if (await creditTab.count()) { await creditTab.click({ timeout: 4000 }); await page.waitForTimeout(2500); await shot(page, 'moyo-m-2-credit-tab'); }
  // back to no-overpay and open payments dropdown
  const noOver = page.locator('text=/Без переплати/i').first();
  if (await noOver.count()) { await noOver.click({ timeout: 4000 }); await page.waitForTimeout(1500); }
  const dd = page.locator('text=/\\d+\\s*платеж/i').first();
  if (await dd.count()) { await dd.click({ timeout: 4000 }); await page.waitForTimeout(1500); await shot(page, 'moyo-m-3-payments-open'); }
  await page.close();
}

// ===== ALLO: find on-page installment widget near price (not footer) =====
{
  const page = await ctx.newPage();
  await page.goto('https://allo.ua/ua/products/mobile/samsung-galaxy-fold-8-ultra-16-1tb-graphite-sm-f976bzknsek.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  // list installment-ish clickable elements with vertical position
  const cands = await page.evaluate(() => {
    const rx = /части|розстрочк|розтермінув|кредит/i;
    const res = [];
    document.querySelectorAll('button, a, div[role="button"], span').forEach((el) => {
      const t = (el.textContent || '').trim();
      if (t && t.length < 40 && rx.test(t)) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) res.push({ t: t.replace(/\s+/g,' '), y: Math.round(r.top + window.scrollY), tag: el.tagName });
      }
    });
    return res.sort((a,b)=>a.y-b.y).slice(0, 12);
  });
  console.log('ALLO candidates:', JSON.stringify(cands, null, 0));
  // click topmost non-footer one
  const top = cands.find(c => c.y < 3000);
  if (top) {
    const el = page.locator(`${top.tag.toLowerCase()}:has-text("${top.t}")`).first();
    try {
      await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
      await shot(page, 'allo-widget-inline');
      await el.click({ timeout: 5000 }); await page.waitForTimeout(3000);
      await shot(page, 'allo-widget-modal');
    } catch(e){ console.log('  allo click err', e.message.split('\n')[0]); }
  }
  await page.close();
}

// ===== FOXTROT: click a real product tile =====
{
  const page = await ctx.newPage();
  await page.goto('https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  // click first product tile title link
  const tile = page.locator('a.card-figure__link, .product-card a[href*=".html"], article a[href*=".html"]').first();
  const cnt = await tile.count();
  console.log('foxtrot tiles:', cnt);
  if (cnt) {
    const href = await tile.getAttribute('href');
    console.log('foxtrot tile href:', href);
    await tile.click({ timeout: 6000 }).catch(()=>{});
    await page.waitForTimeout(5500);
    await shot(page, 'foxtrot-product-real2');
    const trig = page.locator('text=/Оплата частинами|розстрочк|розтермінув/i').first();
    if (await trig.count()) {
      await trig.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
      await shot(page, 'foxtrot-widget-inline');
      try { await trig.click({ timeout: 5000 }); await page.waitForTimeout(3000); await shot(page, 'foxtrot-widget-modal'); }
      catch(e){ console.log('  fox click err', e.message.split('\n')[0]); }
    }
  }
  await page.close();
}
await browser.close();
