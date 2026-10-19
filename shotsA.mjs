import { chromium } from 'playwright';
import fs from 'fs';
const token = fs.readFileSync('/tmp/demo-token','utf8').trim();
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
const mk = async (w,h,auth) => { const c = await b.newContext({ viewport:{width:w,height:h} });
  if (auth) await c.addCookies([{ name:'it_session', value:token, url:base }]); return c; };
for (const [name,w,h,path,auth] of [
  ['v5-desktop-landing',1280,800,'/',false],
  ['v5-mobile-landing',390,844,'/',false],
  ['v5-desktop-dashboard',1280,800,'/dashboard',true],
  ['v5-mobile-dashboard',390,844,'/dashboard',true],
]) {
  const c = await mk(w,h,auth); const p = await c.newPage();
  await p.goto(base+path); await p.waitForTimeout(1200);
  await p.screenshot({ path:`/tmp/shots/${name}.png` });
  await c.close();
}
await b.close(); console.log('done');
