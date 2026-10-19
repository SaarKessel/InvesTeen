import { chromium } from 'playwright';
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome',
  args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'] });
const d = await b.newContext({ viewport:{width:1280,height:800} });
const p = await d.newPage();
await p.goto(base); await p.waitForTimeout(5000);
await p.screenshot({ path:'/tmp/shots/v4-desktop-landing-3d.png', timeout: 60000 });
const m = await b.newContext({ viewport:{width:390,height:844} });
const pm = await m.newPage();
await pm.goto(base); await pm.waitForTimeout(5000);
await pm.screenshot({ path:'/tmp/shots/v4-mobile-landing-3d.png', timeout: 60000 });
await b.close();
