import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3215/', { waitUntil: 'load' });
await p.waitForTimeout(11000);
fs.writeFileSync('/tmp/shots7/wide.png', await p.screenshot());
await p.mouse.move(430, 340); await p.mouse.down(); await p.mouse.up();
await p.waitForTimeout(450);
fs.writeFileSync('/tmp/shots7/click.png', await p.screenshot());
await p.evaluate(() => window.scrollTo(0, window.innerHeight * 1.7));
await p.waitForTimeout(5000);
fs.writeFileSync('/tmp/shots7/zoom.png', await p.screenshot());
await b.close();
