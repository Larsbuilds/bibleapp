import { Verse, Chapter } from '../contexts/BibleContext';

export class BibleService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/bible') {
    this.baseUrl = baseUrl;
  }

  async getVerse(reference: string): Promise<Verse> {
    const url = new URL(`${this.baseUrl}/verse/${encodeURIComponent(reference)}`, window.location.origin);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }
    return response.json();
  }

  async getChapter(book: string, chapter: number): Promise<Chapter> {
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(book)}/${chapter}`, window.location.origin);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    return response.json();
  }

  async getBooks(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/books`);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return response.json();
  }

  async getChapterCount(book: string): Promise<number> {
    const url = new URL(`${this.baseUrl}/books/${encodeURIComponent(book)}/chapters`, window.location.origin);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch chapter count');
    }
    return response.json();
  }

  async searchVerses(query: string): Promise<Verse[]> {
    const url = new URL(`${this.baseUrl}/search`, window.location.origin);
    url.searchParams.append('q', query);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to search verses');
    }
    return response.json();
  }

  async getVersesByChapter(book: string, chapter: number): Promise<Verse[]> {
    const url = new URL(`${this.baseUrl}/${encodeURIComponent(book)}/${chapter}/verses`, window.location.origin);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to load verses');
    }
    return response.json();
  }
}

export const bibleService = new BibleService(); 