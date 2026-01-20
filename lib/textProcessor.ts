import { WordFrequency } from '@/types';
import { allStopwords } from './stopwords';

/**
 * 清理文本：移除特殊字符、数字等
 */
export function cleanText(text: string): string {
  // 转换为小写
  let cleaned = text.toLowerCase();
  
  // 移除URL
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  
  // 移除邮箱
  cleaned = cleaned.replace(/[^\s]+@[^\s]+/g, '');
  
  // 移除特殊字符，但保留中文字符、英文字母和空格
  cleaned = cleaned.replace(/[^\u4e00-\u9fa5a-z\s]/g, ' ');
  
  // 移除多余空格
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * 分词：支持中英文混合
 */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  
  // 英文单词：匹配连续的英文字母，最少2个字符
  const englishWords = text.match(/[a-z]{2,}/gi) || [];
  tokens.push(...englishWords);
  
  // 中文字符：每个中文字符作为一个词（可以改进为更智能的分词）
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  tokens.push(...chineseChars);
  
  return tokens;
}

/**
 * 过滤停用词
 */
export function filterStopwords(tokens: string[]): string[] {
  return tokens.filter(token => {
    const lowerToken = token.toLowerCase();
    return !allStopwords.includes(lowerToken) && token.length > 1;
  });
}

/**
 * 统计词频
 */
export function countWordFrequency(tokens: string[]): Map<string, number> {
  const frequency = new Map<string, number>();
  
  tokens.forEach(token => {
    const key = token.toLowerCase();
    frequency.set(key, (frequency.get(key) || 0) + 1);
  });
  
  return frequency;
}

/**
 * 获取高频词汇
 */
export function getTopWords(
  text: string,
  topN: number = 100,
  minFrequency: number = 2
): WordFrequency[] {
  // 清理文本
  const cleaned = cleanText(text);
  
  // 分词
  const tokens = tokenize(cleaned);
  
  // 过滤停用词
  const filtered = filterStopwords(tokens);
  
  // 统计词频
  const frequency = countWordFrequency(filtered);
  
  // 转换为数组并排序
  const wordFrequencies: WordFrequency[] = Array.from(frequency.entries())
    .filter(([_, count]) => count >= minFrequency)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
  
  return wordFrequencies;
}

/**
 * 处理多个文本并合并词频
 */
export function processMultipleTexts(
  texts: string[],
  topN: number = 100,
  minFrequency: number = 2
): WordFrequency[] {
  // 合并所有文本
  const combinedText = texts.join(' ');
  
  // 获取高频词汇
  return getTopWords(combinedText, topN, minFrequency);
}
