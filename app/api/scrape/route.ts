import { NextRequest, NextResponse } from 'next/server';
import { crawlUrls } from '@/lib/scraper';
import { processMultipleTexts } from '@/lib/textProcessor';
import { ScrapeRequest, ScrapeResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();
    const { urls, followLinks = false, maxPages = 5 } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的URL列表' },
        { status: 400 }
      );
    }

    // 限制入口 URL 数量
    if (urls.length > 10) {
      return NextResponse.json(
        { error: '一次最多只能分析10个URL' },
        { status: 400 }
      );
    }

    // 抓取网站内容（可选跟随站内链接）
    const { results, discoveredUrls } = await crawlUrls(urls, {
      followLinks,
      maxPages,
      maxConcurrent: 4,
      timeout: 10000,
    });

    // 提取成功抓取的文本
    const texts: string[] = [];
    const errors: string[] = [];

    results.forEach(result => {
      if (result.error || !result.text) {
        errors.push(`${result.url}: ${result.error || '未获取到内容'}`);
      } else {
        texts.push(result.text);
      }
    });

    if (texts.length === 0) {
      return NextResponse.json(
        { error: '未能从任何URL获取到内容', errors },
        { status: 500 }
      );
    }

    // 处理文本并获取高频词汇
    const wordFrequencies = processMultipleTexts(texts, 100, 2);

    const response: ScrapeResponse = {
      wordFrequencies,
      totalWords: wordFrequencies.reduce((sum, word) => sum + word.value, 0),
      processedUrls: texts.length,
      discoveredUrls,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}
