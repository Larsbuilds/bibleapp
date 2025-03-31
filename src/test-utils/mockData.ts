import { Verse } from '../types/bible';

export const mockVerse = {
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  book: 'John',
  chapter: 3,
  verse: 16,
  translation: 'NIV'
};

export const mockChapter = {
  book: 'John',
  chapter: 3,
  verses: [
    {
      id: 'john-3-16',
      reference: 'John 3:16',
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      book: 'John',
      chapter: 3,
      verse: 16,
      translation: 'NIV'
    }
  ]
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