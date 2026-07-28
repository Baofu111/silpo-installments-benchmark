import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});

async function shot(page, name) {
  await page.screenshot({ path: `screens/${name}.png` });
  console.log('  shot', name);
}

// generic: scroll page, find installment trigger, click, screenshot modal
async function captureInstallment(page, prefix) {
  // dismiss app banners if any
  for (const sel of ['text=/Пізніше|Закрити|Продовжити у веб|×/i']) {
    try { const b = page.locator(sel).first(); if (await b.count()) await b.click({ timeout: 1500 }); } catch {}
  }
  // find installment-related element
  const trig = page.locator('text=/Оплата частинами|Оплатити частинами|Кредит або частинами|розстрочк|розтермінув/i').first();
  const n = await trig.count();
  console.log(`  ${prefix}: installment triggers found=${n}`);
  if (!n) return;
  await trig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await shot(page, `${prefix}-installment-inline`);
  try {
    await trig.click({ timeout: 5000 });
    await page.waitForTimeout(3000);
    await shot(page, `${prefix}-installment-modal`);
    // scroll modal
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(800);
    await shot(page, `${prefix}-installment-modal2`);
  } catch (e) { console.log('  click err', e.message.split('\n')[0]); }
}

// ---- MOYO (real product url) ----
{
  const page = await ctx.newPage();
  await page.goto('https://www.moyo.ua/ua/noutbuk_asus_tuf_gaming_a15_fa506ncq-hn065_90nr0qe7-m003k0/734732.html',
    { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await captureInstallment(page, 'moyo');
  await page.close();
}

// ---- FOXTROT: open real product from category ----
{
  const page = await ctx.newPage();
  await page.goto('https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html',
    { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const link = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a.card-figure__link, a.product-tile__link, a[href*="/shop/"]')]
      .map(x => x.href).find(h => /_telefon|iphone|samsung|xiaomi|smartfon/i.test(h) && /\.html$/.test(h));
    return a || null;
  });
  console.log('foxtrot product:', link);
  if (link) {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    await shot(page, 'foxtrot-product-real');
    await captureInstallment(page, 'foxtrot');
  }
  await page.close();
}

// ---- ALLO: open real product ----
{
  const page = await ctx.newPage();
  await page.goto('https://allo.ua/ua/products/mobile/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const link = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[href]')].map(x => x.href)
      .find(h => /allo\.ua\/ua\/products\/mobile\/[a-z0-9-]{8,}\.html/i.test(h));
    return a || null;
  });
  console.log('allo product:', link);
  if (link) {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    await shot(page, 'allo-product-real');
    await captureInstallment(page, 'allo');
  }
  await page.close();
}

await browser.close();
