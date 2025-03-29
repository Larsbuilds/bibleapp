import { Verse, Chapter, BibleReference, SearchResult } from '@/types/bible';

const API_KEY = import.meta.env.VITE_ESV_API_KEY;
const API_BASE_URL = 'https://api.esv.org/v3/passage/text/';

export const bibleService = {
  async getVerse(reference: BibleReference): Promise<Verse> {
    const response = await fetch(
      `${API_BASE_URL}?q=${reference.book}+${reference.chapter}:${reference.verse}&include-passage-references=false`,
      {
        headers: {
          'Authorization': `Token ${API_KEY}`
        }
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }
    const data = await response.json();
    return {
      id: `${reference.book}-${reference.chapter}-${reference.verse || 1}`,
      reference: `${reference.book} ${reference.chapter}:${reference.verse || 1}`,
      text: data.passages[0],
      book: reference.book,
      chapter: reference.chapter,
      verse: reference.verse || 1,
      translation: 'ESV'
    };
  },

  async getChapter(book: string, chapter: number): Promise<Chapter> {
    const response = await fetch(
      `${API_BASE_URL}?q=${book}+${chapter}&include-passage-references=false`,
      {
        headers: {
          'Authorization': `Token ${API_KEY}`
        }
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    const data = await response.json();
    return {
      book,
      chapter,
      verses: data.passages[0].split('\n').map((text: string, index: number) => ({
        id: `${book}-${chapter}-${index + 1}`,
        reference: `${book} ${chapter}:${index + 1}`,
        text,
        book,
        chapter,
        verse: index + 1,
        translation: 'ESV'
      }))
    };
  },

  async search(query: string): Promise<SearchResult> {
    try {
      const response = await fetch(
        `${API_BASE_URL}?q=${query}&include-passage-references=true`,
        {
          headers: {
            'Authorization': `Token ${API_KEY}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to search verses');
      }
      const data = await response.json();
      const reference = data.query || '';
      const [book, chapterVerse] = reference.split(' ');
      const [chapter, verse] = (chapterVerse || '').split(':').map(Number);
      
      return {
        reference,
        text: data.passages[0] || '',
        book,
        chapter: chapter || 0,
        verse: verse || 0,
        translation: 'ESV',
        relevance: 1
      };
    } catch (error) {
      console.error('Error searching verses:', error);
      throw error;
    }
  },

  async getBooks(): Promise<string[]> {
    return [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms',
      'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
      'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
      'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
      'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John',
      'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians', 'Colossians',
      '1 Thessalonians', '2 Thessalonians', '1 Timothy',
      '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
      'James', '1 Peter', '2 Peter', '1 John',
      '2 John', '3 John', 'Jude', 'Revelation'
    ];
  },

  async getChapterCount(book: string): Promise<number> {
    const chapterCounts: { [key: string]: number } = {
      'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36,
      'Deuteronomy': 34, 'Joshua': 24, 'Judges': 21, 'Ruth': 4,
      '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
      '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
      'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
      'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8,
      'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
      'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3,
      'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7,
      'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
      'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
      'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21,
      'Acts': 28, 'Romans': 16, '1 Corinthians': 16,
      '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
      'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
      '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
      'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
      '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1,
      '3 John': 1, 'Jude': 1, 'Revelation': 22
    };
    return chapterCounts[book] || 0;
  },

  async getVersesByChapter(book: string, chapter: number): Promise<Verse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/verses/${book}/${chapter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch verses');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
  }
}; 