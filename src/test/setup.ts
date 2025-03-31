import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ReactNode } from 'react';
import { Chapter, Verse } from '@/contexts/BibleContext';

interface BibleState {
  currentChapter: Chapter | null;
  currentVerse: Verse | null;
  isLoading: boolean;
  error: string | null;
  highlightedVerses: string[];
  bookmarkedVerses: string[];
}

// Mock BibleContext
vi.mock('@/contexts/BibleContext', () => {
  const mockState: BibleState = {
    currentChapter: null,
    currentVerse: null,
    isLoading: false,
    error: null,
    highlightedVerses: [],
    bookmarkedVerses: [],
  };

  return {
    useBible: vi.fn(() => ({
      ...mockState,
      setCurrentChapter: vi.fn().mockImplementation((chapter: Chapter | null) => {
        mockState.currentChapter = chapter;
        mockState.currentVerse = null;
        return Promise.resolve();
      }),
      setCurrentVerse: vi.fn().mockImplementation((verse: Verse | null) => {
        mockState.currentVerse = verse;
        return Promise.resolve();
      }),
      loadChapter: vi.fn().mockImplementation(async (book: string, chapter: number) => {
        mockState.isLoading = true;
        try {
          const chapterData: Chapter = {
            book,
            chapter,
            verses: []
          };
          mockState.currentChapter = chapterData;
          mockState.error = null;
        } catch (err) {
          mockState.error = 'Failed to load chapter';
          mockState.currentChapter = null;
        } finally {
          mockState.isLoading = false;
        }
      }),
      highlightVerse: vi.fn().mockImplementation((id: string) => {
        mockState.highlightedVerses = [...mockState.highlightedVerses, id];
        return Promise.resolve();
      }),
      unhighlightVerse: vi.fn().mockImplementation((id: string) => {
        mockState.highlightedVerses = mockState.highlightedVerses.filter(v => v !== id);
        return Promise.resolve();
      }),
      bookmarkVerse: vi.fn().mockImplementation((id: string) => {
        mockState.bookmarkedVerses = [...mockState.bookmarkedVerses, id];
        return Promise.resolve();
      }),
      unbookmarkVerse: vi.fn().mockImplementation((id: string) => {
        mockState.bookmarkedVerses = mockState.bookmarkedVerses.filter(v => v !== id);
        return Promise.resolve();
      }),
    })),
    BibleProvider: ({ children }: { children: ReactNode }) => children,
  };
});

// Mock SearchContext
vi.mock('@/contexts/SearchContext', () => ({
  SearchContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
    Consumer: ({ children }: { children: ReactNode }) => children,
    displayName: 'SearchContext',
  },
  useSearch: vi.fn(() => ({
    searchResults: [],
    searchHistory: [],
    isLoading: false,
    error: null,
    performSearch: vi.fn().mockImplementation(() => Promise.resolve()),
    clearResults: vi.fn(),
    clearError: vi.fn(),
  })),
  SearchProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Make vi available globally
(window as any).vi = vi;

// Extend expect with jest-dom matchers
expect.extend({});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 