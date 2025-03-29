import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Verse } from '../../contexts/BibleContext';
import debounce from 'lodash/debounce';

export const SearchView: React.FC = () => {
  const { searchResults, isLoading, error, performSearch, searchHistory, clearError } = useSearch();
  const [query, setQuery] = useState('');
  const [isReferenceSearch, setIsReferenceSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'relevance' | 'book' | 'chapter' | 'verse'>('relevance');
  const itemsPerPage = 10;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Sort results based on current sort order
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortOrder) {
      case 'book':
        return a.book.localeCompare(b.book);
      case 'chapter':
        return a.chapter - b.chapter;
      case 'verse':
        return a.verse - b.verse;
      default:
        return 0; // relevance sorting is handled by the API
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // Focus search input on mount
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Focus results when they change
    if (searchResults.length > 0) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        resultsRef.current?.focus();
        setFocusedIndex(0);
      }, 0);
    }
  }, [searchResults]);

  // Focus management effect
  useEffect(() => {
    if (focusedIndex >= 0) {
      const searchResults = document.querySelectorAll('[role="listitem"]');
      const focusedElement = searchResults[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.focus();
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    // Update refs array when results change
    resultRefs.current = resultRefs.current.slice(0, paginatedResults.length);
  }, [paginatedResults]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, page: number, order: 'relevance' | 'book' | 'chapter' | 'verse') => {
      performSearch(searchQuery, page, order);
    }, 300),
    [performSearch]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setCurrentPage(1); // Reset to first page on new search
    await performSearch(query, 1, sortOrder);
  };

  const handleHistoryClick = async (historyQuery: string) => {
    setQuery(historyQuery);
    setIsReferenceSearch(false);
    setCurrentPage(1); // Reset to first page on new search
    await performSearch(historyQuery, 1, sortOrder);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(query, page, sortOrder);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as 'relevance' | 'book' | 'chapter' | 'verse';
    setSortOrder(newSortOrder);
    performSearch(query, currentPage, newSortOrder);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    clearError();
    if (newQuery.trim()) {
      debouncedSearch(newQuery, 1, sortOrder);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleResultKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < paginatedResults.length - 1) {
          setFocusedIndex(index + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Handle selection if needed
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search Bible verses..."
            className="flex-1 input input-bordered"
            role="searchbox"
            aria-label="Search Bible verses"
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            aria-label="Perform search"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="mt-2">
          <label className="label cursor-pointer">
            <span className="label-text">Search by reference</span>
            <input
              type="checkbox"
              checked={isReferenceSearch}
              onChange={(e) => setIsReferenceSearch(e.target.checked)}
              className="checkbox"
              aria-label="Search by reference"
            />
          </label>
        </div>
      </form>

      {error && (
        <div className="alert alert-error mb-4" role="alert">
          <span>{error}</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="space-y-4"
          role="region"
          aria-label="Search results"
          aria-live="polite"
          tabIndex={-1}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Search Results</h2>
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="select select-bordered"
              aria-label="Sort by"
            >
              <option value="relevance">Sort by relevance</option>
              <option value="book">Sort by book</option>
              <option value="chapter">Sort by chapter</option>
              <option value="verse">Sort by verse</option>
            </select>
          </div>
          <ul className="space-y-4">
            {paginatedResults.map((result: Verse, index: number) => (
              <li 
                key={`${result.reference}-${index}`}
                className={`card bg-base-100 shadow-xl ${focusedIndex === index ? 'ring-2 ring-primary' : ''}`}
                role="listitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                onKeyDown={(e) => handleResultKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
              >
                <div className="card-body">
                  <h3 className="card-title">{result.reference}</h3>
                  <p>{result.text}</p>
                </div>
              </li>
            ))}
          </ul>
          
          {totalPages > 1 && (
            <nav role="navigation" className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm"
                aria-label="Previous page"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm"
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}

      {searchHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Search History</h2>
          <div className="space-y-2">
            {searchHistory.map((item: string) => (
              <button
                key={item}
                onClick={() => handleHistoryClick(item)}
                className="btn btn-ghost w-full justify-start"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 