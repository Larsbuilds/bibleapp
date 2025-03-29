import { Verse } from '../types/bible';

export const mockVerse: Verse = {
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  book: 'John',
  chapter: 3,
  verse: 16,
  translation: 'NIV'
};

export const mockVerses: Verse[] = [
  mockVerse,
  {
    id: 'john-3-17',
    reference: 'John 3:17',
    text: 'For God did not send his Son into the world to condemn the world...',
    book: 'John',
    chapter: 3,
    verse: 17,
    translation: 'NIV'
  }
]; 