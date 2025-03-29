import React from 'react';
import { Verse } from '@/types/bible';
interface BibleVerseProps {
    verse: Verse;
    onHighlight?: (verseId: string) => void;
    onBookmark?: (verseId: string) => void;
}
export declare const BibleVerse: React.FC<BibleVerseProps>;
export {};
