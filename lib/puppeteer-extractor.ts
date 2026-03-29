import puppeteer, { Browser, Page } from 'puppeteer';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory cache with expiry (1 hour)
const downloadCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function stealthPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    (window as any).chrome = { runtime: {} };
  });
  page.setDefaultNavigationTimeout(60000);
  return page;
}

async function safeClosed(page: Page): Promise<void> {
  try {
    if (page && !page.isClosed()) await page.close();
  } catch {}
}

async function safeEval<T>(page: Page, fn: () => T): Promise<T | null> {
  try {
    if (page.isClosed()) return null;
    return await page.evaluate(fn);
  } catch (err: any) {
    if (
      err.message?.includes('Session closed') ||
      err.message?.includes('Target closed') ||
      err.message?.includes('detached') ||
      err.message?.includes('Protocol error')
    ) {
      return null;
    }
    throw err;
  }
}

async function getDownloadLink(browser: Browser, gamePage: Page): Promise<string | null> {
  try {
    if (gamePage.isClosed()) return null;

    // Open modal
    await safeEval(gamePage, () => {
      const btn =
        document.querySelector('button[\\@click*="open-download-modal"]') ||
        document.querySelector('button[x-on\\:click*="open-download-modal"]');
      if (btn) {
        (btn as HTMLButtonElement).click();
        return;
      }

      window.dispatchEvent(new CustomEvent('open-download-modal'));

      const btns = [...document.querySelectorAll('button')];
      const dlBtn = btns.find((b) => {
        const t = (b.textContent || '').trim();
        return t === 'Download' || (t.includes('Download') && t.length < 20);
      });
      if (dlBtn) (dlBtn as HTMLButtonElement).click();
    });

    await sleep(2000);
    if (gamePage.isClosed()) return null;

    // Click download button
    const navPromise = gamePage
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 })
      .catch(() => null);

    await safeEval(gamePage, () => {
      let btn = document.querySelector('a.download-button');

      if (!btn) {
        const allAs = [...document.querySelectorAll('a')];
        btn = allAs.find((a) => {
          const onClick =
            a.getAttribute('@click.prevent') || a.getAttribute('x-on:click.prevent') || '';
          return onClick.includes('generateDownloadUrl');
        });
      }

      if (!btn) {
        const allAs = [...document.querySelectorAll('a')];
        btn = allAs.find((a) => {
          const t = (a.textContent || '').trim();
          return t === 'Download' && a.classList.contains('download-button');
        });
      }

      if (btn) {
        (btn as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'center' });
        (btn as HTMLElement).click();
        return 'clicked';
      }

      return 'not_found';
    });

    await navPromise;
    if (gamePage.isClosed()) return null;

    // Wait for download link
    let downloadUrl: string | null = null;

    for (let attempt = 0; attempt < 30; attempt++) {
      if (gamePage.isClosed()) return null;

      downloadUrl = await safeEval(gamePage, () => {
        // Check links
        for (const a of document.querySelectorAll('a[href]')) {
          const h = (a as HTMLAnchorElement).href;
          if (/dlproxy|tunnel\d*\.dl/i.test(h)) return h;
        }

        // Check URL
        if (/dlproxy|tunnel\d*\.dl/i.test(window.location.href)) return window.location.href;

        // Check Alpine.js data
        const xDataEls = document.querySelectorAll('[x-data]');
        for (const el of xDataEls) {
          const data = (el as any)._x_dataStack?.[0] || (el as any).__x?.$data;
          if (data) {
            if (data.downloadUrl) return data.downloadUrl;
            if (data.download_url) return data.download_url;
            if (data.directUrl) return data.directUrl;
            if (
              data.url &&
              typeof data.url === 'string' &&
              data.url.startsWith('http')
            )
              return data.url;

            // Check all values
            for (const val of Object.values(data)) {
              if (typeof val === 'string' && /dlproxy|tunnel/i.test(val)) return val;
            }
          }
        }

        // Check scripts
        for (const script of document.querySelectorAll('script:not([src])')) {
          const t = script.textContent || '';
          const m = t.match(/https?:\/\/tunnel\d*\.dlproxy\.[^\s"'`<>\\)]+/i);
          if (m) return m[0].replace(/["'`;].*$/, '');
        }

        // Check data attributes
        for (const el of document.querySelectorAll('[data-url],[data-download-url],[data-href]')) {
          const u =
            (el as any).dataset.url ||
            (el as any).dataset.downloadUrl ||
            (el as any).dataset.href ||
            '';
          if (/dlproxy|tunnel/i.test(u)) return u;
        }

        return null;
      });

      if (downloadUrl) break;
      await sleep(1000);
    }

    if (downloadUrl) {
      return downloadUrl.replace(/["'`;>\s].*$/, '').trim();
    }

    return null;
  } catch (err) {
    console.error('Download link extraction error:', err);
    return null;
  }
}

export async function extractDownloadLink(gameUrl: string): Promise<string | null> {
  // Check cache
  const cached = downloadCache.get(gameUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Using cached download link');
    return cached.url;
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Launching Puppeteer for:', gameUrl);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await stealthPage(browser);
    await page.goto(gameUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    await sleep(8000); // Wait for security verification

    const downloadUrl = await getDownloadLink(browser, page);

    if (downloadUrl) {
      // Cache it
      downloadCache.set(gameUrl, { url: downloadUrl, timestamp: Date.now() });
      console.log('✅ Download link extracted and cached');
      return downloadUrl;
    }

    console.log('⚠️ No download link found');
    return null;
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    return null;
  } finally {
    if (page) await safeClosed(page);
    if (browser) await browser.close().catch(() => {});
  }
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of downloadCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      downloadCache.delete(key);
    }
  }
}, 60 * 1000); // Every minute
