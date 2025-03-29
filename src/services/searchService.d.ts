import { SearchResult } from '@/types/bible';
export declare const searchService: {
    search(query: string, page?: number, pageSize?: number): Promise<SearchResult>;
    searchByReference(reference: string): Promise<SearchResult>;
    getSearchHistory(): Promise<string[]>;
    saveSearchQuery(query: string): Promise<void>;
};
