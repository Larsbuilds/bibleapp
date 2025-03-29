import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ReactNode } from 'react';

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