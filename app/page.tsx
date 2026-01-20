'use client';

import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import WordCloud from '@/components/WordCloud';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { WordFrequency, ScrapeResponse } from '@/types';

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            页面高频词汇分析
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            输入网页URL，分析高频词汇并生成可视化词云
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <UrlInput urls={urls} onChange={setUrls} />

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={followLinks}
                onChange={(e) => setFollowLinks(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              跟随站内跳转链接一起分析（同域名）
            </label>

            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="whitespace-nowrap">最多抓取页面：</span>
              <input
                type="number"
                min={1}
                max={30}
                value={maxPages}
                onChange={(e) => setMaxPages(Math.min(30, Math.max(1, Number(e.target.value || 5))))}
                disabled={!followLinks}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                分析中...
              </span>
            ) : (
              '开始分析'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Stats */}
        {stats && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">处理的网站</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.processedUrls}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">发现的链接</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.discoveredUrls ?? stats.processedUrls}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总词数</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalWords}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">高频词数</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {wordFrequencies.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Word Cloud */}
        {loading ? (
          <LoadingSpinner />
        ) : wordFrequencies.length > 0 ? (
          <WordCloud words={wordFrequencies} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              输入URL并点击"开始分析"来生成词云
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
