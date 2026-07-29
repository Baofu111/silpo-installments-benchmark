import { chromium } from 'playwright';
const browser = await chromium.launch();

// Generic desktop context; per-site locale set where it matters
async function mkctx(locale='en-US', width=1440, height=900){
  return browser.newContext({
    viewport: { width, height },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    locale,
  });
}
const shot = (p, n, full=false) => p.screenshot({ path: `screens/${n}.png`, fullPage:full }).then(() => console.log('  shot', n));

async function grab(name, url, locale='en-US', wait=6000, full=true){
  const ctx = await mkctx(locale);
  const p = await ctx.newPage();
  try{
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(wait);
    await shot(p, name, full);
    const title = await p.title();
    console.log('  OK', name, '::', title.slice(0,60));
  }catch(e){ console.log('  ERR', name, '::', e.message.split('\n')[0]); }
  finally{ await p.close(); await ctx.close(); }
}

// Provider landings / demos (globally reachable) -----------------------------
await grab('intl-klarna-installments', 'https://www.klarna.com/us/business/products/installments/', 'en-US');
await grab('intl-klarna-how',          'https://www.klarna.com/us/what-is-klarna/', 'en-US');
await grab('intl-zip-groceries',       'https://zip.co/au/groceries', 'en-AU');
await grab('intl-zip-woolworths',      'https://zip.co/au/store/woolworths', 'en-AU');
await grab('intl-affirm-how',          'https://www.affirm.com/how-it-works', 'en-US');
await grab('intl-kueski-pay',          'https://kueski.com/kueskipay', 'es-MX');

// Retailer product pages (BNPL messaging widget) ------------------------------
await grab('intl-carrefour-fr',        'https://www.carrefour.fr/', 'fr-FR');
await grab('intl-instacart',           'https://www.instacart.com/', 'en-US');

await browser.close();
console.log('done');
