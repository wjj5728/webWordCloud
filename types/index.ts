export interface WordFrequency {
  text: string;
  value: number;
}

export interface ScrapeRequest {
  urls: string[];
  followLinks?: boolean;
  maxPages?: number;
}

export interface ScrapeResponse {
  wordFrequencies: WordFrequency[];
  totalWords: number;
  processedUrls: number;
  discoveredUrls?: number;
  errors?: string[];
}
