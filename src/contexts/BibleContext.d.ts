import React from 'react';
import { Verse, Chapter, BibleReference } from '@/types/bible';
interface BibleContextType {
    currentVerse: Verse | null;
    currentChapter: Chapter | null;
    isLoading: boolean;
    error: string | null;
    setCurrentVerse: (reference: BibleReference) => Promise<void>;
    setCurrentChapter: (book: string, chapter: number) => Promise<void>;
    clearError: () => void;
}
export declare const BibleProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useBible: () => BibleContextType;
export {};
