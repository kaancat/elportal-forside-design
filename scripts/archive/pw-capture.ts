import { chromium, ConsoleMessage, Request } from 'playwright';

async function capture(route: string) {
  const base = process.env.PW_BASE_URL || 'http://localhost:3005';
  const url = `${base}${route}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleLogs: { type: string; text: string }[] = [];
  const requests: { method: string; url: string; status?: number }[] = [];

  page.on('console', (msg: ConsoleMessage) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('requestfinished', async (req: Request) => {
    const resp = await req.response();
    requests.push({ method: req.method(), url: req.url(), status: resp?.status() });
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paints = performance.getEntriesByType('paint') as any[];
    const fcp = paints.find((e) => e.name === 'first-contentful-paint')?.startTime;
    return {
      fcp,
      domContentLoaded: nav?.domContentLoadedEventEnd,
      load: nav?.loadEventEnd,
      ttfb: nav?.responseStart,
    };
  });

  await browser.close();

  return { consoleLogs, requests, perf };
}

async function main() {
  const routes = ['/', '/elpriser', '/sammenlign'];
  const results: Record<string, any> = {};
  for (const r of routes) {
    results[r] = await capture(r);
  }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


