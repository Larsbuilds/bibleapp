import { Verse, Chapter, BibleReference, SearchResult } from '@/types/bible';
export declare const bibleService: {
    getVerse(reference: BibleReference): Promise<Verse>;
    getChapter(book: string, chapter: number): Promise<Chapter>;
    search(query: string): Promise<SearchResult>;
    getBooks(): Promise<string[]>;
    getChapterCount(book: string): Promise<number>;
    getVersesByChapter(book: string, chapter: number): Promise<Verse[]>;
};
