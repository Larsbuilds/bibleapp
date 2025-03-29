import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BibleProvider } from '@/contexts/BibleContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { vi } from 'vitest';

const defaultBibleContext = {
  currentChapter: null,
  currentVerse: null,
  isLoading: false,
  error: null,
  highlightedVerses: [],
  bookmarkedVerses: [],
  setCurrentChapter: vi.fn(),
  setCurrentVerse: vi.fn(),
  loadChapter: vi.fn(),
  highlightVerse: vi.fn(),
  unhighlightVerse: vi.fn(),
  bookmarkVerse: vi.fn(),
  unbookmarkVerse: vi.fn(),
};

const defaultSearchContext = {
  searchResults: [],
  searchHistory: [],
  isLoading: false,
  error: null,
  performSearch: vi.fn(),
  clearResults: vi.fn(),
  clearError: vi.fn(),
};

export const renderWithProviders = (
  ui: React.ReactElement,
  bibleContextValue = defaultBibleContext,
  searchContextValue = defaultSearchContext
) => {
  return render(
    <BrowserRouter>
      <BibleProvider value={bibleContextValue}>
        <SearchProvider value={searchContextValue}>
          {ui}
        </SearchProvider>
      </BibleProvider>
    </BrowserRouter>
  );
};

export const renderWithBibleProvider = (
  ui: React.ReactElement,
  contextValue = defaultBibleContext
) => {
  return render(
    <BrowserRouter>
      <BibleProvider value={contextValue}>
        {ui}
      </BibleProvider>
    </BrowserRouter>
  );
};

export const renderWithSearchProvider = (
  ui: React.ReactElement,
  contextValue = defaultSearchContext
) => {
  return render(
    <BrowserRouter>
      <SearchProvider value={contextValue}>
        {ui}
      </SearchProvider>
    </BrowserRouter>
  );
};

export * from '@testing-library/react'; 