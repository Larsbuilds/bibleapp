import { Verse, Chapter } from '../../contexts/BibleContext';

export const mockVerse: Verse = {
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
  book: 'John',
  chapter: 3,
  verse: 16,
  translation: 'NIV'
};

export const mockChapter: Chapter = {
  book: 'John',
  chapter: 3,
  verses: [
    mockVerse,
    {
      id: 'john-3-17',
      reference: 'John 3:17',
      text: 'For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.',
      book: 'John',
      chapter: 3,
      verse: 17,
      translation: 'NIV'
    }
  ]
};

export const mockBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel'];

export const mockSearchResults = [
  mockVerse,
  {
    id: 'john-3-17',
    reference: 'John 3:17',
    text: 'For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.',
    book: 'John',
    chapter: 3,
    verse: 17,
    translation: 'NIV'
  }
]; 