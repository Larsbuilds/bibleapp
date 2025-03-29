import { bibleService } from '../bibleService';
import { server } from '@/test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

describe('bibleService', () => {
  it('fetches a verse by reference', async () => {
    const reference = { book: 'John', chapter: 3, verse: 16 };
    const verse = await bibleService.getVerse(reference);
    
    expect(verse).toBeDefined();
    expect(verse.reference).toBe('John 3:16');
    expect(verse.text).toBe('For God so loved the world...');
  });

  it('fetches a chapter', async () => {
    const chapter = await bibleService.getChapter('John', 3);
    
    expect(chapter).toBeDefined();
    expect(chapter.book).toBe('John');
    expect(chapter.chapter).toBe(3);
    expect(chapter.verses).toHaveLength(1);
  });

  it('handles API errors gracefully', async () => {
    // Override the handler to simulate an error
    server.use(
      http.get('/api/bible/verse/:reference', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const reference = { book: 'John', chapter: 3, verse: 16 };
    await expect(bibleService.getVerse(reference)).rejects.toThrow('Failed to fetch verse');
  });
}); 