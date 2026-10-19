import { chromium } from 'playwright';
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome',
  args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'] });
// clip: desktop landing with video recording
const cv = await b.newContext({ viewport:{width:1280,height:800}, recordVideo:{ dir:'/tmp/clips', size:{width:1280,height:800} } });
const p = await cv.newPage();
await p.goto(base); await p.waitForTimeout(4500);
await p.mouse.move(700,400); await p.waitForTimeout(3500);
await p.screenshot({ path:'
