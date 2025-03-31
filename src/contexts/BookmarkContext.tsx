import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bookmark } from '@/types/bible';
import { bookmarkService } from '@/services/bookmarkService';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  addBookmark: (verseId: string, note?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  updateBookmark: (bookmarkId: string, note: string) => Promise<void>;
  isBookmarked: (verseId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const data = await bookmarkService.getBookmarks();
      setBookmarks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookmarks');
      console.error('Error loading bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addBookmark = async (verseId: string, note?: string) => {
    try {
      const newBookmark = await bookmarkService.addBookmark(verseId, note);
      setBookmarks((prev) => [...prev, newBookmark]);
      setError(null);
    } catch (err) {
      setError('Failed to add bookmark');
      console.error('Error adding bookmark:', err);
      throw err;
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      setError(null);
    } catch (err) {
      setError('Failed to remove bookmark');
      console.error('Error removing bookmark:', err);
      throw err;
    }
  };

  const updateBookmark = async (bookmarkId: string, note: string) => {
    try {
      const updatedBookmark = await bookmarkService.updateBookmark(bookmarkId, note);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? updatedBookmark : b))
      );
      setError(null);
    } catch (err) {
      setError('Failed to update bookmark');
      console.error('Error updating bookmark:', err);
      throw err;
    }
  };

  const isBookmarked = (verseId: string) => {
    return bookmarks.some((b) => b.verseId === verseId);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isLoading,
        error,
        addBookmark,
        removeBookmark,
        updateBookmark,
        isBookmarked,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}; 