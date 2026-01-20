'use client';

import { useEffect, useRef, useState } from 'react';
import { WordFrequency } from '@/types';

interface WordCloudProps {
  words: WordFrequency[];
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#6366f1',
  '#f97316',
];

const colorOf = (text: string) => {
  const idx = Math.abs(text.charCodeAt(0)) % COLORS.length;
  return COLORS[idx];
};

export default function WordCloudComponent({ words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [mounted, setMounted] = useState(false);
  const [layoutWords, setLayoutWords] = useState<
    Array<{
      text: string;
      value: number;
      x: number;
      y: number;
      rotate: number;
      size: number;
    }>
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth || 600;
        // 控制最大尺寸，避免 d3-cloud 内部画布过大导致 OOM
        const maxWidth = 700;
        const maxHeight = 450;
        const width = Math.min(Math.max(containerWidth - 32, 320), maxWidth);
        const height = Math.min(Math.max(width * 0.62, 260), maxHeight);
        setDimensions({ width, height });
      }
    };

    if (mounted) {
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !words || words.length === 0) {
      return;
    }

    // 只取前 50 个词（比之前更保守），避免 d3-cloud 内部栅格过大
    const topWords = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    const run = async () => {
      try {
        // d3-cloud 是 CJS 包，Next/TS 下用动态导入更稳
        const cloudMod: any = await import('d3-cloud');
        const cloudFactory = cloudMod.default ?? cloudMod;

        const d3: any = await import('d3');
        const scaleSqrt = d3.scaleSqrt;

        const values = topWords.map((w) => w.value);
        const minV = Math.min(...values);
        const maxV = Math.max(...values);
        const fontSize = scaleSqrt()
          .domain([minV || 1, maxV || 1])
          .range([14, 54]);

        const layout = cloudFactory()
          .size([dimensions.width, dimensions.height])
          .words(
            topWords.map((w) => ({
              text: w.text,
              value: w.value,
            }))
          )
          .padding(2)
          .rotate(() => (Math.random() < 0.15 ? 90 : 0))
          .font('Inter, system-ui, sans-serif')
          .fontSize((d: any) => fontSize(d.value))
          .spiral('archimedean')
          .on('end', (out: any[]) => {
            // 只保留必要字段，减少 React state 体积
            setLayoutWords(
              out.map((d: any) => ({
                text: d.text,
                value: d.value,
                x: d.x,
                y: d.y,
                rotate: d.rotate,
                size: d.size,
              }))
            );
          });

        layout.start();

        // 清理：下一次 effect 触发时，停止旧布局，减少并发占用
        return () => {
          try {
            layout.stop();
          } catch {}
        };
      } catch (error) {
        console.error('d3-cloud generation error:', error);
      }
      return () => {};
    };

    let cleanup: (() => void) | undefined;
    run().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [words, dimensions, mounted]);

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        暂无数据可显示
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div ref={containerRef} className="w-full max-w-6xl flex justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="max-w-full h-auto"
          role="img"
          aria-label="词云"
        >
          <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
            {layoutWords.map((w, idx) => (
              <text
                key={`${w.text}-${idx}`}
                textAnchor="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: w.size,
                  fill: colorOf(w.text),
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                <title>{`${w.text}: ${w.value} 次出现`}</title>
                {w.text}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
