import { SearchResult } from '@/types/bible';

const API_BASE_URL = '/api/bible';

export const searchService = {
  async search(query: string, page: number = 1, pageSize: number = 20): Promise<SearchResult> {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error('Failed to search verses');
    }
    return response.json();
  },

  async searchByReference(reference: string): Promise<SearchResult> {
    const response = await fetch(
      `${API_BASE_URL}/search/reference?q=${encodeURIComponent(reference)}`
    );
    if (!response.ok) {
      throw new Error('Failed to search by reference');
    }
    return response.json();
  },

  async getSearchHistory(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/search/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch search history');
    }
    return response.json();
  },

  async saveSearchQuery(query: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/search/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      throw new Error('Failed to save search query');
    }
  }
}; 