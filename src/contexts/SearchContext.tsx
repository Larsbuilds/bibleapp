import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchResult } from '@/types/bible';
import { searchService } from '@/services/searchService';

interface SearchContextType {
  searchResults: SearchResult | null;
  searchHistory: string[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  searchByReference: (reference: string) => Promise<void>;
  clearError: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchService.search(query);
      setSearchResults(results);
      await searchService.saveSearchQuery(query);
      const history = await searchService.getSearchHistory();
      setSearchHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByReference = useCallback(async (reference: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchService.searchByReference(reference);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search by reference');
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
        search: performSearch,
        searchByReference,
        clearError,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 