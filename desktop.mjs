import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  locale: 'uk-UA',
});
const shot = (p, n, full=false) => p.screenshot({ path: `screens/${n}.png`, fullPage:full }).then(() => console.log('  shot', n));

// ALLO desktop
async function allo(){
  const p = await ctx.newPage();
  try{
    await p.goto('https://allo.ua/ua/products/mobile/samsung-galaxy-fold-8-ultra-16-1tb-graphite-sm-f976bzknsek.html',{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(5500);
    await shot(p,'d-allo-product');
    const btn = p.locator('button:has-text("міс")').first();
    console.log('allo credit btn', await btn.count());
    if(await btn.count()){ await btn.scrollIntoViewIfNeeded(); await btn.click({timeout:6000}); await p.waitForTimeout(3500); await shot(p,'d-allo-modal'); }
  }catch(e){console.log('allo err',e.message.split('\n')[0]);}
  finally{await p.close();}
}
// MOYO desktop
async function moyo(){
  const p = await ctx.newPage();
  try{
    await p.goto('https://www.moyo.ua/ua/noutbuk_asus_tuf_gaming_a15_fa506ncq-hn065_90nr0qe7-m003k0/734732.html',{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(5500);
    await shot(p,'d-moyo-product');
    const t = p.locator('text=/Кредит або частинами/i').first();
    if(await t.count()){ await t.scrollIntoViewIfNeeded(); await t.click({timeout:5000}); await p.waitForTimeout(3000); await shot(p,'d-moyo-modal'); }
  }catch(e){console.log('moyo err',e.message.split('\n')[0]);}
  finally{await p.close();}
}
// ROZETKA desktop (may be Cloudflare)
async function rozetka(){
  const p = await ctx.newPage();
  try{
    await p.goto('https://rozetka.com.ua/ua/mobile-phones/c80003/',{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(5000);
    const href = await p.evaluate(()=>{const l=[...document.querySelectorAll('a[href]')].map(a=>a.href);return l.find(h=>/\/p\d+\//.test(h))||null;});
    console.log('rozetka product', href);
    if(href){ await p.goto(href,{waitUntil:'domcontentloaded',timeout:45000}); await p.waitForTimeout(5000); await shot(p,'d-rozetka-product'); }
  }catch(e){console.log('rozetka err',e.message.split('\n')[0]);}
  finally{await p.close();}
}
await allo();
await moyo();
await rozetka();
await browser.close();
