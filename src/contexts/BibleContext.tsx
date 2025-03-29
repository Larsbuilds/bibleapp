import React, { createContext, useContext, useState, useCallback } from 'react';
import { Verse, Chapter, BibleReference } from '@/types/bible';
import { bibleService } from '@/services/bibleService';

interface BibleContextType {
  currentVerse: Verse | null;
  currentChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;
  setCurrentVerse: (reference: BibleReference) => Promise<void>;
  setCurrentChapter: (book: string, chapter: number) => Promise<void>;
  clearError: () => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = useCallback(async (reference: BibleReference) => {
    setIsLoading(true);
    setError(null);
    try {
      const verse = await bibleService.getVerse(reference);
      setCurrentVerse(verse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verse');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchChapter = useCallback(async (book: string, chapter: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const chapterData = await bibleService.getChapter(book, chapter);
      setCurrentChapter(chapterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chapter');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <BibleContext.Provider
      value={{
        currentVerse,
        currentChapter,
        isLoading,
        error,
        setCurrentVerse: fetchVerse,
        setCurrentChapter: fetchChapter,
        clearError,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
}; 