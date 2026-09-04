import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://127.0.0.1:3212/', { waitUntil: 'load' });
await p.waitForTimeout(10000);
await p.mouse.move(1150, 520); await p.waitForTimeout(2000);
fs.writeFileSync('/tmp/shots4/hero-right.png', await p.screenshot({ clip: {x:300,y:60,width:840,height:820} }));
await p.mouse.move(300, 300); await p.mouse.down(); await p.mouse.up();
await p.waitForTimeout(400);
fs.writeFileSync('/tmp/shots4/hero-click.png', await p.screenshot());
async function shoot(label, name) {
  const el = p.locator(`section[aria-label="${label}"]`).first();
  if (!(await el.count())) return;
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(7500);
  fs.writeFileSync(`/tmp/shots4/${name}.png`, await p.screenshot());
}
await shoot('Your profile, at work', 'employee');
await shoot('Proof of work', 'proof');
console.log(JSON.stringify({ pageErrors: errs.slice(0,3) }));
await b.close();
