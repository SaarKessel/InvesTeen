import { chromium } from 'playwright';
import fs from 'fs';
const token = fs.readFileSync('/tmp/demo-token','utf8').trim();
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
const mk = async (w,h) => { const c = await b.newContext({ viewport:{width:w,height:h} });
  await c.addCookies([{ name:'it_session', value:token, url:base }]); return c; };
const m = await mk(390,844); const p = await m.newPage();
for (const [name,path] of [['learn','/learn'],['mentor','/mentor'],['settings','/settings'],['progress','/progress'],['challenges','/challenges']]) {
  await p.goto(base+path); await p.waitForTimeout(1100);
  await p.screenshot({ path:`/tmp/shots/v6-mobile-${name}.png` });
}
await p.goto(base+'/learn/a1-saving-vs-investing'); await p.waitForTimeout(1100);
await p.screenshot({ path:'/tmp/shots/v6-mobile-lesson.png' });
await b.close(); console.log('done');
