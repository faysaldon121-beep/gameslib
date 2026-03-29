import puppeteer, { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function initBrowser(): Promise<Browser> {
  // Check if browser is still alive
  if (browserInstance) {
    try {
      await browserInstance.version();
      console.log('♻️  Reusing browser instance');
      return browserInstance;
    } catch (err) {
      console.log('❌ Browser instance dead, relaunching...');
      try {
        await browserInstance.close().catch(() => {});
      } catch {}
      browserInstance = null;
    }
  }

  console.log('🚀 Launching new browser instance');
  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-popup-blocking',
      '--disable-features=site-per-process',
    ],
  });

  return browserInstance;
}

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

    console.log('🖱️ Opening download modal...');

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

    console.log('🖱️ Clicking download button...');

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

    console.log('⏳ Waiting for download link...');

    // Wait for download link
    let downloadUrl: string | null = null;

    for (let attempt = 0; attempt < 30; attempt++) {
      if (gamePage.isClosed()) return null;

      downloadUrl = await safeEval(gamePage, () => {
        // Check direct links
        for (const a of document.querySelectorAll('a[href]')) {
          const h = (a as HTMLAnchorElement).href;
          if (/dlproxy|tunnel\d*\.dl/i.test(h)) return h;
        }

        // Check current URL
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
          const m2 = t.match(/https?:\/\/[^\s"'`<>\\)]*dlproxy\.[^\s"'`<>\\)]+/i);
          if (m2) return m2[0].replace(/["'`;].*$/, '');
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

      if (downloadUrl) {
        console.log(`✅ Found: ${downloadUrl.substring(0, 80)}...`);
        break;
      }
      await sleep(1000);
    }

    return downloadUrl ? downloadUrl.replace(/["'`;>\s].*$/, '').trim() : null;
  } catch (err) {
    console.error('❌ Download link extraction error:', err);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════════

export async function extractDownloadLink(slug: string, gameUrl: string): Promise<string | null> {
  let browser: Browser;
  let page: Page | null = null;

  try {
    // ✅ Reuse browser instance (or launch if dead)
    browser = await initBrowser();
    page = await stealthPage(browser);

    console.log(`\n📥 Extracting download link for: ${slug}`);
    await page.goto(gameUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for security verification
    await sleep(8000);

    const downloadUrl = await getDownloadLink(browser, page);

    if (!downloadUrl) {
      throw new Error('Failed to extract download link');
    }

    console.log(`✨ Success: ${downloadUrl.substring(0, 100)}...\n`);
    return downloadUrl;
  } catch (error: any) {
    console.error(`\n❌ Error for ${slug}:`, error.message);

    // ✅ Kill browser on error
    if (browserInstance) {
      console.log('🔄 Killing browser instance due to error...');
      try {
        await browserInstance.close().catch(() => {});
      } catch {}
      browserInstance = null;
    }

    return null;
  } finally {
    if (page) await safeClosed(page);
  }
}

// Manual browser status
export async function getBrowserStatus(): Promise<{
  alive: boolean;
  status: string;
}> {
  if (!browserInstance) {
    return { alive: false, status: 'No instance' };
  }

  try {
    const version = await browserInstance.version();
    return { alive: true, status: `Running (${version})` };
  } catch {
    return { alive: false, status: 'Dead' };
  }
}

// Manual restart
export async function restartBrowser(): Promise<void> {
  console.log('🔄 Manual browser restart requested...');
  if (browserInstance) {
    try {
      await browserInstance.close().catch(() => {});
    } catch {}
    browserInstance = null;
  }
  const browser = await initBrowser();
  console.log('✅ Browser restarted');
}
