import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/bible/books', () => {
    return HttpResponse.json([
      'Genesis',
      'Exodus',
      'Leviticus',
      'Numbers',
      'Deuteronomy',
      'Joshua',
      'Judges',
      'Ruth',
      '1 Samuel',
      '2 Samuel',
      '1 Kings',
      '2 Kings',
      '1 Chronicles',
      '2 Chronicles',
      'Ezra',
      'Nehemiah',
      'Esther',
      'Job',
      'Psalms',
      'Proverbs',
      'Ecclesiastes',
      'Song of Solomon',
      'Isaiah',
      'Jeremiah',
      'Lamentations',
      'Ezekiel',
      'Daniel',
      'Hosea',
      'Joel',
      'Amos',
      'Obadiah',
      'Jonah',
      'Micah',
      'Nahum',
      'Habakkuk',
      'Zephaniah',
      'Haggai',
      'Zechariah',
      'Malachi',
      'Matthew',
      'Mark',
      'Luke',
      'John',
      'Acts',
      'Romans',
      '1 Corinthians',
      '2 Corinthians',
      'Galatians',
      'Ephesians',
      'Philippians',
      'Colossians',
      '1 Thessalonians',
      '2 Thessalonians',
      '1 Timothy',
      '2 Timothy',
      'Titus',
      'Philemon',
      'Hebrews',
      'James',
      '1 Peter',
      '2 Peter',
      '1 John',
      '2 John',
      '3 John',
      'Jude',
      'Revelation'
    ]);
  }),

  http.get('/api/bible/books/:book/chapters', ({ params }) => {
    const book = params.book as string;
    // Return a mock chapter count based on the book
    const chapterCounts: Record<string, number> = {
      'Genesis': 50,
      'Exodus': 40,
      'Matthew': 28,
      'Mark': 16,
      'Luke': 24,
      'John': 21,
      // Add more books as needed
    };
    return HttpResponse.json(chapterCounts[book] || 30);
  }),

  http.get('/api/bible/:book/:chapter', ({ params }) => {
    const book = params.book as string;
    const chapter = params.chapter as string;
    return HttpResponse.json({
      book,
      chapter: parseInt(chapter),
      verses: Array.from({ length: 10 }, (_, i) => ({
        id: `${book}-${chapter}-${i + 1}`,
        reference: `${book} ${chapter}:${i + 1}`,
        text: `Sample verse ${i + 1} from ${book} chapter ${chapter}`,
        book,
        chapter: parseInt(chapter),
        verse: i + 1,
        translation: 'NIV'
      }))
    });
  })
]; 