import React from 'react';
import { useBible } from '@/contexts/BibleContext';
import { BibleVerse } from '@/components/BibleVerse/BibleVerse';

export const ReadingView: React.FC = () => {
  const { currentChapter, isLoading, error } = useBible();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Bible App</h2>
          <p className="text-base-content/70">
            Select a book and chapter from the sidebar to start reading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {currentChapter.book} Chapter {currentChapter.chapter}
        </h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" aria-label="Previous chapter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button className="btn btn-ghost btn-sm" aria-label="Next chapter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentChapter.verses.map((verse) => (
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
  );
}; 