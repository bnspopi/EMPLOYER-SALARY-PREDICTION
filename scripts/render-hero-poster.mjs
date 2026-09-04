/**
 * Regenerates public/images/robot-full.{jpg,webp} — the hero's reduced-motion
 * still — by photographing the live hero scene rather than drawing a separate
 * illustration, so the still can never drift from what the 3D actually renders.
 *
 * Usage: build, `next start -p 3111`, then `node scripts/render-hero-poster.mjs`.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const W = 1600, H = 1000;
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
});
const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await pg.goto('http://127.0.0.1:3111/', { waitUntil: 'networkidle', timeout: 90000 });
await pg.waitForTimeout(7000);
// Strip everything but the robot: the existing poster image, the reaching arm's
// overlays, the headline and the HUD panels.
await pg.evaluate(() => {
  document.querySelectorAll('h1, aside, header, footer, [class*="glass"]').forEach(e => (e.style.visibility = 'hidden'));
  document.querySelectorAll('img').forEach(e => (e.style.visibility = 'hidden'));
});
await pg.waitForTimeout(1500);
const canvas = await pg.locator('canvas').first();
await canvas.screenshot({ path: '/tmp/robot-alpha.png', omitBackground: true });
console.log('captured');
await b.close();

// Composite the robot over the studio plate, darkened so the headline reads over it.
const plate = await sharp('public/images/studio-backdrop.jpg')
  .resize(W, H, { fit: 'cover' })
  .modulate({ brightness: 0.42 })
  .toBuffer();
const robot = await sharp('/tmp/robot-alpha.png').resize(W, H, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).toBuffer();
await sharp(plate).composite([{ input: robot }]).webp({ quality: 86 }).toFile('public/images/robot-full.webp');
await sharp(plate).composite([{ input: robot }]).jpeg({ quality: 84 }).toFile('public/images/robot-full.jpg');
console.log('poster written');
