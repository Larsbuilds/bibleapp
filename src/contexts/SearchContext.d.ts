import React from 'react';
import { SearchResult } from '../types/search';
export interface SearchContextType {
    searchResults: SearchResult[];
    searchHistory: string[];
    isLoading: boolean;
    error: string | null;
    performSearch: (query: string) => Promise<void>;
    clearError: () => void;
}
export declare const SearchContext: React.Context<SearchContextType | undefined>;
export declare const SearchProvider: React.FC<{
    children: React.ReactNode;
}>;
