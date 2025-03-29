import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { bibleService } from '../services/bibleService';
import { Verse } from './BibleContext';

interface SearchContextType {
  searchResults: Verse[];
  searchHistory: string[];
  isLoading: boolean;
  error: string | null;
  performSearch: (query: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

const SEARCH_HISTORY_KEY = 'bibleapp_search_history';
const MAX_HISTORY_ITEMS = 10;

interface SearchProviderProps {
  children: React.ReactNode;
  value?: SearchContextType;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children, value: testValue }) => {
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);

  const updateSearchHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  }, []);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await bibleService.searchVerses(query);
      setSearchResults(results);
      updateSearchHistory(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  }, [updateSearchHistory]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = testValue || {
    searchResults,
    searchHistory,
    isLoading,
    error,
    performSearch,
    clearResults,
    clearError,
  };

  return (
    <SearchContext.Provider value={value}>
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