import { Verse } from '../types/bible';

export const DEFAULT_VERSE: Verse = {
  id: '',
  reference: '',
  text: '',
  book: '',
  chapter: 0,
  verse: 0,
  translation: 'NIV'
};

export const DEFAULT_CHAPTER = {
  book: '',
  chapter: 0,
  verses: [] as Verse[]
};

export const getVerseReference = (verse: Verse): string => {
  return `${verse.book} ${verse.chapter}:${verse.verse}`;
};

export const parseReference = (reference: string): { book: string; chapter: number; verse: number } | null => {
  const match = reference.match(/^(\w+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verse: parseInt(match[3])
  };
}; 