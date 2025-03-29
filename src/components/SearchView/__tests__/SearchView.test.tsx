import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchView } from '../SearchView';
import { SearchProvider } from '@/contexts/SearchContext';
import { useSearch } from '@/hooks/useSearch';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockSearchResults = [
  {
    book: 'John',
    chapter: 3,
    id: 'john-3-16',
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    translation: 'NIV',
    verse: 16,
  },
];

const mockSearchHistory = ['love', 'faith', 'hope'];

// Mock the useSearch hook
vi.mock('@/hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    searchResults: [],
    isLoading: false,
    error: null,
    performSearch: vi.fn(),
    searchHistory: [],
    clearResults: vi.fn(),
    clearError: vi.fn(),
  })),
}));

const renderWithSearchProvider = (ui: React.ReactElement) => {
  return render(
    <SearchProvider>
      {ui}
    </SearchProvider>
  );
};

describe('SearchView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Form', () => {
    it('renders search form with all required elements', () => {
      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: /perform search/i });
      const referenceToggle = screen.getByRole('checkbox');
      
      expect(searchInput).toBeInTheDocument();
      expect(searchButton).toBeInTheDocument();
      expect(referenceToggle).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search Bible verses...');
    });

    it('handles input changes correctly', () => {
      const mockClearError = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: mockClearError,
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(searchInput).toHaveValue('test query');
      expect(mockClearError).toHaveBeenCalled();
    });

    it('toggles reference search mode', () => {
      renderWithSearchProvider(<SearchView />);
      
      const referenceToggle = screen.getByRole('checkbox');
      expect(referenceToggle).not.toBeChecked();
      
      fireEvent.click(referenceToggle);
      expect(referenceToggle).toBeChecked();
    });
  });

  describe('Search Functionality', () => {
    it('performs search when form is submitted', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: /perform search/i });

      fireEvent.change(searchInput, { target: { value: 'love' } });
      fireEvent.click(searchButton);

      expect(mockPerformSearch).toHaveBeenCalledWith('love', 1, 'relevance');
    });

    it('does not perform search with empty query', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchButton = screen.getByRole('button', { name: /perform search/i });
      fireEvent.click(searchButton);

      expect(mockPerformSearch).not.toHaveBeenCalled();
    });

    it('shows loading state during search', async () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: true,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchButton = screen.getByRole('button', { name: /perform search/i });
      expect(searchButton).toBeDisabled();
      expect(searchButton).toHaveTextContent('Searching...');
    });
  });

  describe('Search Results', () => {
    it('displays search results correctly', () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText(mockSearchResults[0].reference)).toBeInTheDocument();
      expect(screen.getByText(mockSearchResults[0].text)).toBeInTheDocument();
    });

    it('shows no results message when search returns empty', () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
    });
  });

  describe('Search History', () => {
    it('displays search history correctly', () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: mockSearchHistory,
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      expect(screen.getByText('Search History')).toBeInTheDocument();
      mockSearchHistory.forEach(term => {
        expect(screen.getByText(term)).toBeInTheDocument();
      });
    });

    it('performs search when clicking history item', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: mockSearchHistory,
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const historyItem = screen.getByText(mockSearchHistory[0]);
      fireEvent.click(historyItem);

      expect(mockPerformSearch).toHaveBeenCalledWith(mockSearchHistory[0], 1, 'relevance');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when search fails', () => {
      const errorMessage = 'Search failed';
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: errorMessage,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('clears error when performing new search', async () => {
      const mockClearError = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: 'Search failed',
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: mockClearError,
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through search results', async () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [...mockSearchResults, ...mockSearchResults, ...mockSearchResults],
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchResults = screen.getAllByRole('listitem');
      
      // Focus the first result
      await act(async () => {
        searchResults[0].focus();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Test arrow key navigation
      await act(async () => {
        fireEvent.keyDown(searchResults[0], { key: 'ArrowDown' });
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      await act(async () => {
        fireEvent.keyDown(searchResults[1], { key: 'ArrowUp' });
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Verify that the first result is focused again
      expect(document.activeElement).toBe(searchResults[0]);
    });

    it('supports keyboard shortcuts for search', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });
      });
      
      expect(mockPerformSearch).toHaveBeenCalledWith('test', 1, 'relevance');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithSearchProvider(<SearchView />);
      
      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search Bible verses');
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-label', 'Search by reference');
      expect(screen.getByRole('button', { name: /perform search/i })).toHaveAttribute('aria-label', 'Perform search');
    });

    it('announces search results to screen readers', () => {
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const resultsRegion = screen.getByRole('region', { name: /search results/i });
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('handles focus management during search', async () => {
      const { rerender } = renderWithSearchProvider(<SearchView />);
      
      // Initial focus should be on search input
      expect(document.activeElement).toBe(screen.getByRole('searchbox'));
      
      // After search results are loaded, focus should move to results
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });
      
      rerender(<SearchProvider><SearchView /></SearchProvider>);
      
      // Wait for the focus effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      const firstResult = screen.getByRole('listitem');
      expect(document.activeElement).toBe(firstResult);
    });
  });

  describe('Search Debounce', () => {
    it('debounces search input', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: [],
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const searchInput = screen.getByRole('searchbox');
      
      // Type multiple characters quickly
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 't' } });
        fireEvent.change(searchInput, { target: { value: 'te' } });
        fireEvent.change(searchInput, { target: { value: 'tes' } });
        fireEvent.change(searchInput, { target: { value: 'test' } });
      });
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockPerformSearch).toHaveBeenCalledTimes(1);
        expect(mockPerformSearch).toHaveBeenCalledWith('test', 1, 'relevance');
      }, { timeout: 400 });
    });
  });

  describe('Pagination', () => {
    it('displays pagination controls when there are multiple pages', () => {
      const manyResults = Array(25).fill(mockSearchResults[0]);
      vi.mocked(useSearch).mockReturnValue({
        searchResults: manyResults,
        isLoading: false,
        error: null,
        performSearch: vi.fn(),
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles page changes', () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: Array(25).fill(mockSearchResults[0]),
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const nextPageButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextPageButton);
      
      expect(mockPerformSearch).toHaveBeenCalledWith(expect.any(String), 2, 'relevance');
    });
  });

  describe('Sorting', () => {
    it('allows sorting search results', () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.change(sortSelect, { target: { value: 'book' } });
      
      expect(mockPerformSearch).toHaveBeenCalledWith(expect.any(String), 1, 'book');
    });

    it('persists sort order between searches', async () => {
      const mockPerformSearch = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        searchResults: mockSearchResults,
        isLoading: false,
        error: null,
        performSearch: mockPerformSearch,
        searchHistory: [],
        clearResults: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithSearchProvider(<SearchView />);
      
      // Set sort order
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: 'book' } });
      });
      
      // Perform new search
      const searchInput = screen.getByRole('searchbox');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
      });
      
      // Wait for the debounced search to be called
      await waitFor(() => {
        expect(mockPerformSearch).toHaveBeenCalledWith('test', 1, 'book');
      }, { timeout: 400 });
    });
  });
}); 