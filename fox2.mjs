import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});
const shot = (p, n, full=false) => p.screenshot({ path: `screens/${n}.png`, fullPage:full }).then(() => console.log('  shot', n));
const page = await ctx.newPage();
await page.goto('https://www.foxtrot.com.ua/uk/shop/mobilni_telefoni.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(5000);
// grab hrefs from product tiles: anchors inside elements with class containing 'card' whose href not a category
const href = await page.evaluate(() => {
  const cats = /mobilni_telefoni|mobilnye_telefony|smartfon(y)?\.html$|_apple\.html$|_samsung\.html$|_xiaomi\.html$/i;
  const set = new Set();
  document.querySelectorAll('a[href*="/shop/"][href$=".html"]').forEach(a=>{
    const h=a.getAttribute('href'); if(h && !cats.test(h)) set.add(h);
  });
  return [...set][0] || null;
});
console.log('FOX product href:', href);
if (href) {
  const url = href.startsWith('http')?href:('https://www.foxtrot.com.ua'+href);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5500);
  // find installment trigger near price
  const info = await page.evaluate(() => {
    const rx=/Оплата частинами|розстроч|розтермін|частинами/i; let best=null;
    document.querySelectorAll('a,button,[role=button],div,span').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t&&t.length<40&&rx.test(t)&&el.children.length<=1){const r=el.getBoundingClientRect(); if(r.width>0&&r.height>0){const y=r.top+window.scrollY; if((!best||y<best.y)&&y<4000) best={t:t.replace(/\s+/g,' '),y:Math.round(y),tag:el.tagName};}}
    });
    return best;
  });
  console.log('FOX trigger:', JSON.stringify(info));
  if(info){
    await page.evaluate(y=>window.scrollTo(0,Math.max(0,y-250)), info.y);
    await page.waitForTimeout(1200);
    await shot(page,'foxtrot-inline');
    try{
      const el = page.locator(`${info.tag.toLowerCase()}:has-text("${info.t}")`).first();
      await el.click({timeout:5000}); await page.waitForTimeout(3500);
      await shot(page,'foxtrot-modal');
    }catch(e){console.log('click err',e.message.split('\n')[0]);}
  } else {
    await shot(page,'foxtrot-inline', true);
  }
}
await browser.close();
