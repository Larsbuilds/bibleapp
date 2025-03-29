import { useState, useCallback } from 'react';
import { Verse } from '../contexts/BibleContext';

interface UseSearchReturn {
  searchResults: Verse[];
  isLoading: boolean;
  error: string | null;
  searchHistory: string[];
  performSearch: (query: string, page?: number, sortOrder?: 'relevance' | 'book' | 'chapter' | 'verse') => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const performSearch = useCallback(async (
    query: string,
    page: number = 1,
    sortOrder: 'relevance' | 'book' | 'chapter' | 'verse' = 'relevance'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call with pagination and sorting
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&sort=${sortOrder}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data.results);
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
        return newHistory;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    searchHistory,
    performSearch,
    clearResults,
    clearError,
  };
}; 