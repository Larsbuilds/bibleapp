import { vi } from 'vitest';
import { BibleService } from '../bibleService';

const mockVerse = {
  book: 'John',
  chapter: 3,
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  translation: 'NIV',
  verse: 16,
};

const mockChapter = {
  book: 'John',
  chapter: 3,
  verses: [mockVerse],
};

describe('bibleService', () => {
  let bibleService: BibleService;

  beforeEach(() => {
    vi.clearAllMocks();
    bibleService = new BibleService();
  });

  it('fetches a verse', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVerse),
    });

    const result = await bibleService.getVerse('John 3:16');
    expect(result).toEqual(mockVerse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/verse/John%203%3A16')
    );
  });

  it('fetches a chapter', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChapter),
    });

    const result = await bibleService.getChapter('John', 3);
    expect(result).toEqual(mockChapter);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/John/3')
    );
  });

  it('searches verses', async () => {
    const searchResults = [mockVerse];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(searchResults),
    });

    const result = await bibleService.searchVerses('love');
    expect(result).toEqual(searchResults);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/search?q=love')
    );
  });

  it('handles API errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(bibleService.getVerse('John 3:16')).rejects.toThrow('Failed to fetch verse');
  });

  it('fetches list of books', async () => {
    const mockBooks = ['Genesis', 'Exodus', 'Leviticus'];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBooks),
    });

    const result = await bibleService.getBooks();
    expect(result).toEqual(mockBooks);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/books')
    );
  });

  it('fetches chapter count for a book', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(50),
    });

    const result = await bibleService.getChapterCount('Genesis');
    expect(result).toBe(50);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/books/Genesis/chapters')
    );
  });

  it('fetches verses by chapter', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChapter.verses),
    });

    const result = await bibleService.getVersesByChapter('John', 3);
    expect(result).toEqual(mockChapter.verses);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bible/John/3/verses')
    );
  });
}); 