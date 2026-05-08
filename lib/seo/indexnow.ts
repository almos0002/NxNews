const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function extractHost(url: string): string {
  try { return new URL(url).hostname; } catch { return ""; }
}

/**
 * Submit one or more URLs to IndexNow so Bing, Yandex, and other
 * participating engines pick them up within minutes.
 *
 * Fire-and-forget safe: all errors are caught and logged; never throws.
 * Call without await so it never blocks the response to the client.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  const host = extractHost(urls[0]);
  if (!host) return;

  const keyLocation = `https://${host}/${key}.txt`;
  const urlList = urls.slice(0, 10_000);

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
    });
    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] submitted ${urlList.length} URL(s) → ${res.status}`);
    } else {
      const body = await res.text().catch(() => "");
      console.warn(`[IndexNow] submit failed ${res.status}`, body.slice(0, 200));
    }
  } catch (err) {
    console.warn("[IndexNow] network error", err instanceof Error ? err.message : err);
  }
}

/**
 * Build all locale variants of an article URL for submission.
 * Returns both /en/article/slug and /ne/article/slug.
 */
export function articleUrls(baseUrl: string, slug: string): string[] {
  const b = baseUrl.replace(/\/$/, "");
  return [`${b}/en/article/${slug}`, `${b}/ne/article/${slug}`];
}
