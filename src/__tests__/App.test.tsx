import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { useSearch } from '@/hooks/useSearch';
import { useBible } from '@/contexts/BibleContext';

// Mock the BibleContext
vi.mock('@/contexts/BibleContext', () => ({
  BibleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useBible: vi.fn(() => ({
    isLoading: false,
    error: null,
    currentChapter: null,
    currentVerse: null,
    highlightedVerses: [],
    bookmarkedVerses: [],
    loadChapter: vi.fn(),
    setCurrentChapter: vi.fn(),
    setCurrentVerse: vi.fn(),
    highlightVerse: vi.fn(),
    unhighlightVerse: vi.fn(),
    bookmarkVerse: vi.fn(),
    unbookmarkVerse: vi.fn(),
  })),
}));

// Mock the SearchContext
vi.mock('@/contexts/SearchContext', () => ({
  SearchProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSearch: () => ({
    searchResults: [],
    isLoading: false,
    error: null,
    performSearch: vi.fn(),
    searchHistory: [],
    clearResults: vi.fn(),
    clearError: vi.fn(),
  }),
}));

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<App />);
    });
    // The app should render without throwing any errors
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('redirects to reading view when accessing root path', async () => {
    await act(async () => {
      render(<App />);
    });
    // Initial render should redirect to /reading
    expect(window.location.pathname).toBe('/reading');
  });

  it('renders reading view when accessing /reading', async () => {
    window.history.pushState({}, '', '/reading');
    await act(async () => {
      render(<App />);
    });
    // The reading view should be rendered
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('redirects to reading view for unknown paths', async () => {
    window.history.pushState({}, '', '/unknown');
    await act(async () => {
      render(<App />);
    });
    expect(window.location.pathname).toBe('/reading');
  });

  describe('Route Transitions', () => {
    it('navigates between reading and search views', async () => {
      await act(async () => {
        render(<App />);
      });

      // Navigate to search view
      const searchLink = screen.getByRole('link', { name: /search/i });
      fireEvent.click(searchLink);
      expect(window.location.pathname).toBe('/search');

      // Navigate back to reading view
      const readingLink = screen.getByRole('link', { name: /reading/i });
      fireEvent.click(readingLink);
      expect(window.location.pathname).toBe('/reading');
    });

    it('preserves state during navigation', async () => {
      // Mock initial state
      vi.mocked(useBible).mockReturnValue({
        isLoading: false,
        error: null,
        currentChapter: { 
          book: 'Genesis', 
          chapter: 1, 
          verses: [{
            id: '1',
            text: 'Test verse',
            verse: 1,
            book: 'Genesis',
            chapter: 1,
            reference: 'Genesis 1:1',
            translation: 'NIV'
          }]
        },
        currentVerse: null,
        highlightedVerses: [],
        bookmarkedVerses: [],
        loadChapter: vi.fn(),
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
      });

      render(<App />);

      // Navigate to search view
      const searchLink = screen.getByRole('link', { name: /search/i });
      fireEvent.click(searchLink);

      // Navigate back to reading view
      const readingLink = screen.getByRole('link', { name: /reading/i });
      fireEvent.click(readingLink);

      // Verify state is preserved
      expect(screen.getByText('Test verse')).toBeInTheDocument();
    });
  });

  describe('Context Providers', () => {
    it('provides BibleContext to components', async () => {
      await act(async () => {
        render(<App />);
      });

      // Test that BibleContext values are available
      expect(screen.getByText(/select a book and chapter/i)).toBeInTheDocument();
    });

    it('provides SearchContext to components', async () => {
      window.history.pushState({}, '', '/search');
      await act(async () => {
        render(<App />);
      });

      // Test that SearchContext values are available
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('catches and displays errors in components', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      await act(async () => {
        render(
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        );
      });

      // Wait for error boundary to render
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByText(/test error/i)).toBeInTheDocument();
      });
    });

    it('allows recovery from errors', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      await act(async () => {
        render(
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        );
      });

      // Wait for error boundary to render
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Wait for error boundary to recover
      await waitFor(() => {
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during navigation', async () => {
      // Mock loading state
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: true,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      await act(async () => {
        render(<App />);
      });

      // Navigate to search view
      const searchLink = screen.getByRole('link', { name: /search/i });
      fireEvent.click(searchLink);

      // Loading state should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Mock loaded state
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      // Wait for navigation to complete
      await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('shows loading state during data fetching', async () => {
      // Mock loading state
      vi.mocked(useBible).mockReturnValue({
        isLoading: true,
        error: null,
        currentChapter: null,
        currentVerse: null,
        highlightedVerses: [],
        bookmarkedVerses: [],
        loadChapter: vi.fn(),
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
      });

      await act(async () => {
        render(<App />);
      });

      // Loading state should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Mock loaded state
      vi.mocked(useBible).mockReturnValue({
        isLoading: false,
        error: null,
        currentChapter: { 
          book: 'Genesis', 
          chapter: 1, 
          verses: [{
            id: '1',
            text: 'Test verse',
            verse: 1,
            book: 'Genesis',
            chapter: 1,
            reference: 'Genesis 1:1',
            translation: 'NIV'
          }]
        },
        currentVerse: null,
        highlightedVerses: [],
        bookmarkedVerses: [],
        loadChapter: vi.fn(),
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText('Test verse')).toBeInTheDocument();
      });
    });
  });
}); 