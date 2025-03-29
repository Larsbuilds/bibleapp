import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Bible API endpoints
  http.get('/api/bible/verse/:reference', ({ params }) => {
    const reference = params.reference as string;
    return HttpResponse.json({
      id: reference,
      reference: reference,
      text: 'For God so loved the world...',
      book: 'John',
      chapter: 3,
      verse: 16,
      translation: 'NIV'
    });
  }),

  http.get('/api/bible/chapter/:book/:chapter', ({ params }) => {
    const book = params.book as string;
    const chapter = params.chapter as string;
    return HttpResponse.json({
      book,
      chapter: parseInt(chapter),
      verses: [
        {
          id: `${book}-${chapter}-1`,
          reference: `${book} ${chapter}:1`,
          text: 'Sample verse 1',
          book,
          chapter: parseInt(chapter),
          verse: 1,
          translation: 'NIV'
        },
        // Add more mock verses as needed
      ]
    });
  }),

  // Add more handlers as needed
]; 