import React from 'react';
import { Verse } from '@/types/bible';
import { useBible } from '@/contexts/BibleContext';
import { useBookmarks } from '@/contexts/BookmarkContext';

interface BibleVerseProps {
  verse: Verse;
  onHighlight?: (verseId: string) => void;
}

export const BibleVerse: React.FC<BibleVerseProps> = ({ verse, onHighlight }) => {
  const { currentVerse } = useBible();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const isCurrentVerse = currentVerse?.id === verse.id;
  const bookmarked = isBookmarked(verse.id);

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        const bookmark = await removeBookmark(verse.id);
      } else {
        await addBookmark(verse.id);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        isCurrentVerse ? 'bg-primary/10' : 'bg-base-100'
      } transition-colors duration-200`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold text-primary">{verse.reference}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onHighlight?.(verse.id)}
            className="btn btn-ghost btn-sm"
            aria-label="Highlight verse"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handleBookmark}
            className={`btn btn-ghost btn-sm ${bookmarked ? 'text-primary' : ''}`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark verse'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-lg leading-relaxed">{verse.text}</p>
    </div>
  );
}; 