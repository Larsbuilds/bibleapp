import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchResult } from '../../types/search';

export const SearchView: React.FC = () => {
  const { searchResults, isLoading, error, performSearch, searchHistory } = useSearch();
  const [query, setQuery] = useState('');
  const [isReferenceSearch, setIsReferenceSearch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await performSearch(query);
  };

  const handleHistoryClick = async (historyQuery: string) => {
    setQuery(historyQuery);
    setIsReferenceSearch(false);
    await performSearch(historyQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Bible verses..."
            className="flex-1 input input-bordered"
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
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
            />
          </label>
        </div>
      </form>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Search Results</h2>
          {searchResults.map((result: SearchResult, index: number) => (
            <div key={`${result.reference}-${index}`} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{result.reference}</h3>
                <p>{result.text}</p>
              </div>
            </div>
          ))}
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