import { chromium } from 'playwright';
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome',
  args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'] });
const cv = await b.newContext({ viewport:{width:1280,height:800}, recordVideo:{ dir:'/tmp/clips', size:{width:1280,height:800} } });
const p = await cv.newPage();
await p.goto(base); await p.waitForTimeout(6000);
await p.screenshot({ path:'/tmp/shots/v4-desktop-landing-3d.png' });
await cv.close();
const m = await b.newContext({ viewport:{width:390,height:844} });
const pm = await m.newPage();
await pm.goto(base); await pm.waitForTimeout(6000);
await pm.screenshot({ path:'/tmp/shots/v4-mobile-landing-3d.png' });
await b.close();
