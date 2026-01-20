import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  text: string;
  error?: string;
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function extractSameOriginLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (href.startsWith('#')) return;

    try {
      const u = new URL(href, base);
      // 只跟随同域名链接（避免跳出站点）
      if (u.origin !== base.origin) return;
      // 过滤明显的非页面资源
      const pathname = u.pathname.toLowerCase();
      if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|rar|mp4|mp3|webm)$/)) return;

      // 去掉 hash
      u.hash = '';
      links.add(u.toString());
    } catch {
      // ignore invalid URL
    }
  });

  return Array.from(links);
}

/**
 * 抓取单个网页的内容
 */
export async function scrapeUrl(url: string, timeout: number = 10000): Promise<ScrapeResult> {
  try {
    url = normalizeUrl(url);

    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      },
    });

    const $ = cheerio.load(response.data);

    // 移除script和style标签
    $('script, style, noscript, iframe').remove();

    // 提取文本内容
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text() || '';

    // 合并所有文本
    const fullText = [title, metaDescription, bodyText].join(' ');

    return {
      url,
      text: fullText,
    };
  } catch (error: any) {
    return {
      url: normalizeUrl(url),
      text: '',
      error: error.message || 'Failed to scrape URL',
    };
  }
}

/**
 * 并发抓取多个URL
 */
export async function scrapeUrls(urls: string[], maxConcurrent: number = 5): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  // 分批处理，避免过多并发请求
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => scrapeUrl(url))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 抓取入口 URL，并可选跟随站内链接（广度优先，限制最大页面数）
 */
export async function crawlUrls(
  entryUrls: string[],
  opts?: { followLinks?: boolean; maxPages?: number; maxConcurrent?: number; timeout?: number }
): Promise<{ results: ScrapeResult[]; discoveredUrls: number }> {
  const followLinks = Boolean(opts?.followLinks);
  const maxPages = Math.min(Math.max(opts?.maxPages ?? 5, 1), 30);
  const maxConcurrent = Math.min(Math.max(opts?.maxConcurrent ?? 4, 1), 6);
  const timeout = opts?.timeout ?? 10000;

  const queue: string[] = entryUrls.map(normalizeUrl);
  const seen = new Set<string>(queue);
  const results: ScrapeResult[] = [];

  while (queue.length > 0 && results.length < maxPages) {
    const batch = queue.splice(0, maxConcurrent);
    const batchResults = await Promise.all(batch.map((u) => scrapeUrl(u, timeout)));
    results.push(...batchResults);

    if (!followLinks) continue;

    // 对成功页面提取站内链接加入队列
    for (const r of batchResults) {
      if (results.length >= maxPages) break;
      if (r.error || !r.text) continue;

      // 重新请求 HTML 来提取链接（更轻量的话可以在 scrapeUrl 返回 html，但这里保持接口简单）
      // 这里用 axios 复用同一个 url 拉取 HTML，再抽链接；失败则跳过
      try {
        const htmlResp = await axios.get(r.url, { timeout });
        const links = extractSameOriginLinks(htmlResp.data, r.url);
        for (const link of links) {
          if (seen.size >= maxPages) break;
          if (!seen.has(link)) {
            seen.add(link);
            queue.push(link);
          }
        }
      } catch {
        // ignore link extraction failure
      }
    }
  }

  return { results: results.slice(0, maxPages), discoveredUrls: seen.size };
}
