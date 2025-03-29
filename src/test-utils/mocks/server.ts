import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { mockVerse, mockChapter } from './mockData';

export const handlers = [
  http.get('/api/bible/verse/:reference', () => {
    return HttpResponse.json(mockVerse);
  }),

  http.get('/api/bible/:book/:chapter', () => {
    return HttpResponse.json(mockChapter);
  }),

  http.get('/api/bible/books', () => {
    return HttpResponse.json(['Genesis', 'Exodus', 'Leviticus']);
  }),

  http.get('/api/bible/books/:book/chapters', () => {
    return HttpResponse.json(50);
  }),

  http.get('/api/bible/search', () => {
    return HttpResponse.json([mockVerse]);
  }),
];

export const server = setupServer(...handlers); 