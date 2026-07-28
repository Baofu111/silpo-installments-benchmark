import { chromium } from 'playwright';

const sites = [
  { name: 'comfy',   cat: 'https://comfy.ua/ua/smartfony/' },
  { name: 'foxtrot', cat: 'https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html' },
  { name: 'allo',    cat: 'https://allo.ua/ua/products/mobile/' },
  { name: 'moyo',    cat: 'https://www.moyo.ua/ua/telefony-i-gadzhety/smartfony/' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});

for (const s of sites) {
  const page = await ctx.newPage();
  try {
    await page.goto(s.cat, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4500);
    const title = await page.title();
    // find a product link
    const href = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href]')].map((a) => a.href);
      return (
        links.find((h) => /\/(p|product)[\/\-_]?\d+/i.test(h)) ||
        links.find((h) => /\.html$/.test(h) && /\d{5,}/.test(h)) ||
        null
      );
    });
    console.log(`\n=== ${s.name} | cat title="${title.slice(0,40)}" | product=${href}`);
    if (!href) { await page.screenshot({ path: `screens/${s.name}-cat.png` }); await page.close(); continue; }

    await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `screens/${s.name}-product-top.png` });

    const found = await page.evaluate(() => {
      const rx = /частинами|розстрочк|розтермінув|оплата\s+части/i;
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length === 0 && el.textContent && rx.test(el.textContent)) {
          const t = el.textContent.trim().replace(/\s+/g,' ').slice(0, 70);
          if (t) out.push(t);
        }
      }
      return [...new Set(out)].slice(0, 15);
    });
    console.log('hits:', found.length ? '\n  ' + found.join('\n  ') : 'none');
  } catch (e) {
    console.log(`=== ${s.name}: ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}
await browser.close();
