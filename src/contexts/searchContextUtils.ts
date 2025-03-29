import { SearchResult } from '../types/search';

export const MAX_HISTORY_ITEMS = 10;

export const DEFAULT_SEARCH_RESULT: SearchResult = {
  reference: '',
  text: '',
  book: '',
  chapter: 0,
  verse: 0,
  translation: 'NIV',
  relevance: 0
};

export const isReferenceSearch = (query: string): boolean => {
  return /^[A-Za-z]+\s+\d+:\d+$/.test(query);
};

export const formatSearchHistoryItem = (query: string, timestamp: number): string => {
  return `${query}|${timestamp}`;
};

export const parseSearchHistoryItem = (item: string): { query: string; timestamp: number } => {
  const [query, timestamp] = item.split('|');
  return { query, timestamp: parseInt(timestamp) };
}; 