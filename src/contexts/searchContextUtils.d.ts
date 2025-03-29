import { SearchResult } from '../types/search';
export declare const MAX_HISTORY_ITEMS = 10;
export declare const DEFAULT_SEARCH_RESULT: SearchResult;
export declare const isReferenceSearch: (query: string) => boolean;
export declare const formatSearchHistoryItem: (query: string, timestamp: number) => string;
export declare const parseSearchHistoryItem: (item: string) => {
    query: string;
    timestamp: number;
};
