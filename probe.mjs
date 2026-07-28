import { chromium } from 'playwright';

const targets = [
  { name: 'rozetka', url: 'https://rozetka.com.ua/' },
  { name: 'comfy', url: 'https://comfy.ua/' },
  { name: 'foxtrot', url: 'https://www.foxtrot.com.ua/' },
  { name: 'allo', url: 'https://allo.ua/' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, // mobile
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  locale: 'uk-UA',
});

for (const t of targets) {
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    const title = await page.title();
    await page.screenshot({ path: `screens/probe-${t.name}.png` });
    console.log(`${t.name}: status=${resp?.status()} title="${title.slice(0, 60)}"`);
  } catch (e) {
    console.log(`${t.name}: ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}
await browser.close();
