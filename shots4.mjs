import { chromium } from 'playwright';
import fs from 'fs';
const token = fs.readFileSync('/tmp/demo-token','utf8').trim();
const base = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
const c = await b.newContext({ viewport:{width:390,height:844} });
await c.addCookies([{ name:'it_session', value:token, url:base }]);
const p = await c.newPage();
await p.goto(base+'/onboarding'); await p.waitForTimeout(800);
await p.getByText('התחילו באבחון').click(); await p.waitForTimeout(500);
for (let qi=0; qi<6; qi++) { await p.locator('fieldset').nth(qi).locator('input[type=radio]').nth(qi===4?0:1).check(); }
await p.getByRole('button', { name:'למסלול שלי' }).click(); await p.waitForTimeout(2000);
await p.screenshot({ path:'/tmp/shots/v3-mobile-onboarding-path.png' });
await b.close();
