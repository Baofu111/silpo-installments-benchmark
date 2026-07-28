import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const page = await ctx.newPage();

// open a phones category, then first product
await page.goto('https://rozetka.com.ua/ua/mobile-phones/c80003/', {
  waitUntil: 'domcontentloaded',
  timeout: 45000,
});
await page.waitForTimeout(4000);

// grab first product link (product URLs look like /p<digits>/)
const href = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.href);
  return links.find((h) => /\/p\d+\//.test(h)) || null;
});
console.log('first product:', href);

if (href) {
  await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: 'screens/rozetka-product-top.png' });

  // search for installment-related text nodes
  const found = await page.evaluate(() => {
    const rx = /частинами|розстрочк|розтермінув|платіж|кредит/i;
    const out = [];
    const walk = document.querySelectorAll('body *');
    for (const el of walk) {
      if (el.children.length === 0 && el.textContent && rx.test(el.textContent)) {
        const t = el.textContent.trim().slice(0, 80);
        if (t) out.push(t);
      }
    }
    return [...new Set(out)].slice(0, 30);
  });
  console.log('installment text hits:\n' + found.join('\n'));

  // try clicking an installment trigger
  const trigger = page.locator('text=/частинами|розстрочк/i').first();
  if (await trigger.count()) {
    try {
      await trigger.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screens/rozetka-installment-inline.png' });
      await trigger.click({ timeout: 5000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens/rozetka-installment-modal.png' });
    } catch (e) {
      console.log('click err:', e.message.split('\n')[0]);
    }
  }
}
await browser.close();
