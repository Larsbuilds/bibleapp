import React, { createContext, useState, useCallback } from 'react';
import { SearchResult } from '../types/search';
import { searchService } from '@/services/searchService';

export interface SearchContextType {
  searchResults: SearchResult[];
  searchHistory: string[];
  isLoading: boolean;
  error: string | null;
  performSearch: (query: string) => Promise<void>;
  clearError: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchService.search(query);
      setSearchResults([result]);
      await searchService.saveSearchQuery(query);
      const history = await searchService.getSearchHistory();
      setSearchHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchHistory,
        isLoading,
        error,
        performSearch,
        clearError,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}; 