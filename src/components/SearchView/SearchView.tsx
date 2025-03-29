import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { BibleVerse } from '@/components/BibleVerse/BibleVerse';
import { searchService } from '@/services/searchService';

export const SearchView: React.FC = () => {
  const { searchResults, searchHistory, isLoading, error, search, searchByReference } = useSearch();
  const [query, setQuery] = useState('');
  const [isReferenceSearch, setIsReferenceSearch] = useState(false);

  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await searchService.getSearchHistory();
        // Update history in context
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isReferenceSearch) {
      await searchByReference(query);
    } else {
      await search(query);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setIsReferenceSearch(false);
    search(historyQuery);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verses or enter a reference..."
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Reference</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isReferenceSearch}
                onChange={(e) => setIsReferenceSearch(e.target.checked)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-base-content/70">Recent searches:</span>
            {searchHistory.map((historyQuery) => (
              <button
                key={historyQuery}
                onClick={() => handleHistoryClick(historyQuery)}
                className="btn btn-ghost btn-xs"
              >
                {historyQuery}
              </button>
            ))}
          </div>
        )}
      </div>

      {searchResults && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Found {searchResults.total} results
            </h2>
            {searchResults.page > 1 && (
              <button className="btn btn-ghost btn-sm">Previous</button>
            )}
            {searchResults.page * searchResults.pageSize < searchResults.total && (
              <button className="btn btn-ghost btn-sm">Next</button>
            )}
          </div>

          <div className="space-y-4">
            {searchResults.verses.map((verse) => (
              <BibleVerse
                key={verse.id}
                verse={verse}
                onHighlight={(verseId) => {
                  // TODO: Implement highlighting
                  console.log('Highlight verse:', verseId);
                }}
                onBookmark={(verseId) => {
                  // TODO: Implement bookmarking
                  console.log('Bookmark verse:', verseId);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 