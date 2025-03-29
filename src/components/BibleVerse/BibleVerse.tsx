import React from 'react';
import { useBible } from '@/contexts/BibleContext';

interface BibleVerseProps {
  verse: {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    reference: string;
    text: string;
    translation: string;
  };
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  onShare?: (verse: any) => void;
}

export const BibleVerse: React.FC<BibleVerseProps> = ({
  verse,
  isHighlighted = false,
  isBookmarked = false,
  onShare,
}) => {
  const {
    currentVerse,
    highlightedVerses,
    bookmarkedVerses,
    highlightVerse,
    unhighlightVerse,
    bookmarkVerse,
    unbookmarkVerse,
    isLoading,
    error,
  } = useBible();

  const isVerseHighlighted = isHighlighted || highlightedVerses.includes(verse.id);
  const isVerseBookmarked = isBookmarked || bookmarkedVerses.includes(verse.id);
  const isCurrentVerse = currentVerse?.id === verse.id;

  const handleHighlight = () => {
    if (isVerseHighlighted) {
      unhighlightVerse(verse.id);
    } else {
      highlightVerse(verse.id);
    }
  };

  const handleBookmark = () => {
    if (isVerseBookmarked) {
      unbookmarkVerse(verse.id);
    } else {
      bookmarkVerse(verse.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(verse);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, handler: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  };

  const renderVerseText = (text: string) => {
    // Check if the text contains HTML tags
    if (text.includes('<')) {
      return <span className="text-lg truncate block" dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return <span className="text-lg truncate block">{text}</span>;
  };

  return (
    <div
      data-testid="verse-container"
      className={`p-4 rounded-lg transition-colors duration-200 ${
        isVerseHighlighted || isCurrentVerse ? 'bg-primary/10' : 'bg-base-100'
      } ${isLoading ? 'opacity-50' : ''} ${error ? 'border border-error' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {renderVerseText(verse.text)}
          {verse.reference && (
            <div className="text-sm text-gray-500 mt-1">{verse.reference}</div>
          )}
          {verse.translation && (
            <div className="text-xs text-gray-400">{verse.translation}</div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleHighlight}
            onKeyDown={(e) => handleKeyDown(e, handleHighlight)}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Highlight verse"
            aria-pressed={isVerseHighlighted}
          >
            <span className="sr-only">Highlight verse</span>
            <svg
              className={`w-5 h-5 ${isVerseHighlighted ? 'text-primary' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={handleBookmark}
            onKeyDown={(e) => handleKeyDown(e, handleBookmark)}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Bookmark verse"
            aria-pressed={isVerseBookmarked}
          >
            <span className="sr-only">Bookmark verse</span>
            {isVerseBookmarked ? (
              <svg
                data-testid="bookmark-icon"
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            )}
          </button>
          {onShare && (
            <button
              onClick={handleShare}
              onKeyDown={(e) => handleKeyDown(e, handleShare)}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Share verse"
            >
              <span className="sr-only">Share verse</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 