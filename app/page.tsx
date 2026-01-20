'use client';

import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import WordCloud from '@/components/WordCloud';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { WordFrequency, ScrapeResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link2, Sparkles, Wand2 } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  const [urls, setUrls] = useState<string[]>(['https://web3.career']);
  const [followLinks, setFollowLinks] = useState<boolean>(false);
  const [maxPages, setMaxPages] = useState<number>(5);
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalWords: number; processedUrls: number; discoveredUrls?: number } | null>(null);

  const handleAnalyze = async () => {
    // 验证URL
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('请至少输入一个有效的URL');
      return;
    }

    setLoading(true);
    setError(null);
    setWordFrequencies([]);
    setStats(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: validUrls, followLinks, maxPages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析失败');
      }

      const data: ScrapeResponse = await response.json();
      setWordFrequencies(data.wordFrequencies);
      setStats({
        totalWords: data.totalWords,
        processedUrls: data.processedUrls,
        discoveredUrls: data.discoveredUrls,
      });

      if (data.errors && data.errors.length > 0) {
        setError(`部分URL处理失败: ${data.errors.join('; ')}`);
      }
    } catch (err: any) {
      setError(err.message || '发生未知错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                高频词汇
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Link2 className="h-3.5 w-3.5" />
                支持站内链接跟随
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              页面高频词汇分析
            </h1>
            <p className="mt-1 text-sm md:text-base text-muted-foreground">
              输入网页URL，抓取内容并生成词云（可选跟随同域名跳转链接）
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              默认示例：<span className="font-mono">web3.career</span>
            </div>
            <ModeToggle />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  配置
                </CardTitle>
                <CardDescription>设置抓取范围与分析参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UrlInput urls={urls} onChange={setUrls} />

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="follow-links">跟随站内跳转链接</Label>
                    <div className="text-xs text-muted-foreground">仅同域名（避免跳出站点）</div>
                  </div>
                  <Switch
                    id="follow-links"
                    checked={followLinks}
                    onCheckedChange={(v) => setFollowLinks(Boolean(v))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="max-pages">最多抓取页面</Label>
                    <Input
                      id="max-pages"
                      type="number"
                      min={1}
                      max={30}
                      value={maxPages}
                      onChange={(e) => setMaxPages(Math.min(30, Math.max(1, Number(e.target.value || 5))))}
                      disabled={!followLinks}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>提示</Label>
                    <div className="text-xs text-muted-foreground leading-5">
                      页面越多越慢；建议先从 5 开始测试。
                    </div>
                  </div>
                </div>

                <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                  {loading ? '分析中...' : '开始分析'}
                </Button>
              </CardContent>
            </Card>

            {stats && !loading && (
              <Card>
                <CardHeader>
                  <CardTitle>统计</CardTitle>
                  <CardDescription>本次抓取与分析的概览</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">成功抓取页面</div>
                      <div className="text-2xl font-semibold">{stats.processedUrls}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">发现的链接</div>
                      <div className="text-2xl font-semibold">{stats.discoveredUrls ?? stats.processedUrls}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">总词数</div>
                      <div className="text-2xl font-semibold">{stats.totalWords}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">高频词数</div>
                      <div className="text-2xl font-semibold">{wordFrequencies.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6">
                <ErrorDisplay message={error} onClose={() => setError(null)} />
              </div>
            )}

            <Card className="min-h-[520px]">
              <CardHeader>
                <CardTitle>词云</CardTitle>
                <CardDescription>鼠标悬停可查看词频</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSpinner />
                ) : wordFrequencies.length > 0 ? (
                  <WordCloud words={wordFrequencies} />
                ) : (
                  <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                    输入URL并点击「开始分析」来生成词云
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </main>
  );
}
