import { Bookmark } from '@/types/bible';

const STORAGE_KEY = 'bible_bookmarks';

export const bookmarkService = {
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading bookmarks from storage:', err);
      return [];
    }
  },

  async addBookmark(verseId: string, note?: string): Promise<Bookmark> {
    try {
      const bookmarks = await this.getBookmarks();
      const newBookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        verseId,
        userId: 'local-user', // This will be replaced with actual user ID when we have authentication
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note
      };
      
      bookmarks.push(newBookmark);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      return newBookmark;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      throw new Error('Failed to add bookmark');
    }
  },

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBookmarks));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      throw new Error('Failed to remove bookmark');
    }
  },

  async updateBookmark(bookmarkId: string, note: string): Promise<Bookmark> {
    try {
      const bookmarks = await this.getBookmarks();
      const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId);
      
      if (bookmarkIndex === -1) {
        throw new Error('Bookmark not found');
      }

      const updatedBookmark: Bookmark = {
        ...bookmarks[bookmarkIndex],
        note: note || undefined,
        updatedAt: new Date().toISOString()
      };

      bookmarks[bookmarkIndex] = updatedBookmark;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      return updatedBookmark;
    } catch (err) {
      console.error('Error updating bookmark:', err);
      throw new Error('Failed to update bookmark');
    }
  }
}; 