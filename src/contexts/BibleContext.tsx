import React, { createContext, useContext, useState, useCallback } from 'react';
import { bibleService } from '../services/bibleService';

export interface Verse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  reference: string;
  text: string;
  translation: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

interface BibleContextType {
  currentChapter: Chapter | null;
  currentVerse: Verse | null;
  isLoading: boolean;
  error: string | null;
  highlightedVerses: string[];
  bookmarkedVerses: string[];
  setCurrentChapter: (chapter: Chapter | null) => Promise<void>;
  setCurrentVerse: (verse: Verse | null) => Promise<void>;
  loadChapter: (book: string, chapter: number) => Promise<void>;
  highlightVerse: (verseId: string) => Promise<void>;
  unhighlightVerse: (verseId: string) => Promise<void>;
  bookmarkVerse: (verseId: string) => Promise<void>;
  unbookmarkVerse: (verseId: string) => Promise<void>;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

interface BibleProviderProps {
  children: React.ReactNode;
  value?: Partial<BibleContextType>;
}

export const BibleProvider: React.FC<BibleProviderProps> = ({ children, value: testValue }) => {
  const [state, setState] = useState({
    currentChapter: null as Chapter | null,
    currentVerse: null as Verse | null,
    isLoading: false,
    error: null as string | null,
    highlightedVerses: [] as string[],
    bookmarkedVerses: [] as string[],
  });

  const loadChapter = useCallback(async (book: string, chapter: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const chapterData = await bibleService.getChapter(book, chapter);
      setState(prev => ({
        ...prev,
        currentChapter: chapterData,
        currentVerse: null,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        currentChapter: null,
        currentVerse: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load chapter',
      }));
    }
  }, []);

  const setCurrentChapter = useCallback(async (chapter: Chapter | null) => {
    setState(prev => ({
      ...prev,
      currentChapter: chapter,
      currentVerse: null,
    }));
  }, []);

  const setCurrentVerse = useCallback(async (verse: Verse | null) => {
    setState(prev => ({
      ...prev,
      currentVerse: verse,
    }));
  }, []);

  const highlightVerse = useCallback(async (verseId: string) => {
    setState(prev => ({
      ...prev,
      highlightedVerses: [...prev.highlightedVerses, verseId],
    }));
  }, []);

  const unhighlightVerse = useCallback(async (verseId: string) => {
    setState(prev => ({
      ...prev,
      highlightedVerses: prev.highlightedVerses.filter(id => id !== verseId),
    }));
  }, []);

  const bookmarkVerse = useCallback(async (verseId: string) => {
    setState(prev => ({
      ...prev,
      bookmarkedVerses: [...prev.bookmarkedVerses, verseId],
    }));
  }, []);

  const unbookmarkVerse = useCallback(async (verseId: string) => {
    setState(prev => ({
      ...prev,
      bookmarkedVerses: prev.bookmarkedVerses.filter(id => id !== verseId),
    }));
  }, []);

  const contextValue = {
    ...state,
    setCurrentChapter: testValue?.setCurrentChapter ?? setCurrentChapter,
    setCurrentVerse: testValue?.setCurrentVerse ?? setCurrentVerse,
    loadChapter: testValue?.loadChapter ?? loadChapter,
    highlightVerse: testValue?.highlightVerse ?? highlightVerse,
    unhighlightVerse: testValue?.unhighlightVerse ?? unhighlightVerse,
    bookmarkVerse: testValue?.bookmarkVerse ?? bookmarkVerse,
    unbookmarkVerse: testValue?.unbookmarkVerse ?? unbookmarkVerse,
  };

  return (
    <BibleContext.Provider value={contextValue}>
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