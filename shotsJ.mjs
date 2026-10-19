import { chromium } from 'playwright';
import fs from 'fs';
const token = fs.readFileSync('/tmp/demo-token','utf8').trim();
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
const c = await b.newContext({ viewport:{width:390,height:844} });
await c.addCookies([{ name:'it_session', value:token, url:base }]);
const p = await c.newPage();
// lesson quiz with an option selected
await p.goto(base+'/learn/a2-inflation'); await p.waitForTimeout(1200);
const radio = p.locator('input[type=radio]').first();
await radio.check(); await p.waitForTimeout(400);
await p.screenshot({ path:'/tmp/shots/v7-mobile-lesson.png', fullPage: false });
// mentor: send a message and capture bubbles + dots
await p.goto(base+'/mentor'); await p.waitForTimeout(1000);
await p.fill('input.input', 'מה זה ריבית דריבית?');
await p.click('button:has-text("שליחה")');
await p.waitForTimeout(500);
await p.screenshot({ path:'/tmp/shots/v7-mobile-mentor-sending.png' });
await p.waitForTimeout(2500);
await p.screenshot({ path:'/tmp/shots/v7-mobile-mentor.png' });
// asset trade form with stepper
await p.goto(base+'/markets/OFK'); await p.waitForTimeout(1200);
await p.locator('button[aria-label="עוד"]').first().click(); await p.waitForTimeout(300);
await p.screenshot({ path:'/tmp/shots/v7-mobile-asset-trade.png' });
// challenges
await p.goto(base+'/challenges'); await p.waitForTimeout(1100);
await p.screenshot({ path:'/tmp/shots/v7-mobile-challenges.png' });
// parent with stepper
await p.goto(base+'/parent'); await p.waitForTimeout(1100);
await p.screenshot({ path:'/tmp/shots/v7-mobile-parent.png' });
await b.close(); console.log('done');
