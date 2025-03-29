import { Verse } from '../types/bible';
export declare const DEFAULT_VERSE: Verse;
export declare const DEFAULT_CHAPTER: {
    book: string;
    chapter: number;
    verses: Verse[];
};
export declare const getVerseReference: (verse: Verse) => string;
export declare const parseReference: (reference: string) => {
    book: string;
    chapter: number;
    verse: number;
} | null;
