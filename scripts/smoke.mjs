/**
 * Loads every route against a running production server and fails on any
 * non-200 or any console/page error. Usage: build, `next start -p 3111`,
 * then `node scripts/smoke.mjs`.
 */
import { chromium } from 'playwright';
const ROUTES = ['/', '/pricing', '/salaries', '/for-recruiters', '/dashboard', '/dashboard/market-value',
  '/dashboard/resumes', '/dashboard/improve', '/dashboard/offer-evaluator', '/dashboard/job-search',
  '/dashboard/pipeline', '/dashboard/career-growth', '/dashboard/application-pack/job', '/dashboard/compare', '/dashboard/chat', '/dashboard/settings', '/dashboard/insights', '/blog', '/about', '/help', '/privacy', '/terms',
  '/salaries/software-engineer-salary-2026'];
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],
});
let failed = 0;
for (const r of ROUTES) {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon/i.test(m.text())) errs.push(m.text()); });
  let status = 0;
  try {
    const resp = await pg.goto('http://127.0.0.1:3111' + r, { waitUntil: 'networkidle', timeout: 60000 });
    status = resp?.status() ?? 0;
  } catch (e) { errs.push('NAV ' + e.message); }
  const ok = status === 200 && errs.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${status} ${r}${errs.length ? '  :: ' + errs.slice(0,2).join(' | ') : ''}`);
  await pg.close();
}
console.log(JSON.stringify({ total: ROUTES.length, failed }));
await b.close();
