import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReadingView } from '../ReadingView';
import { BibleProvider } from '@/contexts/BibleContext';
import { useBible } from '@/contexts/BibleContext';

const mockChapter = {
  book: 'John',
  chapter: 3,
  verses: [
    {
      book: 'John',
      chapter: 3,
      id: 'john-3-16',
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      translation: 'NIV',
      verse: 16,
    },
    {
      book: 'John',
      chapter: 3,
      id: 'john-3-17',
      reference: 'John 3:17',
      text: 'For God did not send his Son into the world...',
      translation: 'NIV',
      verse: 17,
    },
  ],
};

// Mock the useBible hook
vi.mock('@/contexts/BibleContext', async () => {
  const actual = await vi.importActual('@/contexts/BibleContext');
  return {
    ...actual,
    useBible: vi.fn(() => ({
      currentChapter: null,
      currentVerse: null,
      isLoading: false,
      error: null,
      setCurrentChapter: vi.fn(),
      setCurrentVerse: vi.fn(),
      loadChapter: vi.fn(),
      highlightVerse: vi.fn(),
      unhighlightVerse: vi.fn(),
      bookmarkVerse: vi.fn(),
      unbookmarkVerse: vi.fn(),
      highlightedVerses: [],
      bookmarkedVerses: [],
    })),
  };
});

const renderWithBibleProvider = (ui: React.ReactElement) => {
  return render(
    <BibleProvider>
      {ui}
    </BibleProvider>
  );
};

describe('ReadingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('displays welcome message when no chapter is selected', () => {
      renderWithBibleProvider(<ReadingView />);
      
      expect(screen.getByText('Welcome to Bible App')).toBeInTheDocument();
      expect(screen.getByText('Select a book and chapter from the sidebar to start reading')).toBeInTheDocument();
    });

    it('displays loading state when loading', () => {
      vi.mocked(useBible).mockReturnValue({
        currentChapter: null,
        currentVerse: null,
        isLoading: true,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays error message when there is an error', () => {
      const errorMessage = 'Failed to load chapter';
      vi.mocked(useBible).mockReturnValue({
        currentChapter: null,
        currentVerse: null,
        isLoading: false,
        error: errorMessage,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Chapter Display', () => {
    it('displays chapter content when loaded', () => {
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      expect(screen.getByText(`${mockChapter.book} Chapter ${mockChapter.chapter}`)).toBeInTheDocument();
      mockChapter.verses.forEach(verse => {
        expect(screen.getByText(verse.text)).toBeInTheDocument();
      });
    });

    it('handles chapter navigation', async () => {
      const mockLoadChapter = vi.fn();
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: mockLoadChapter,
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      const nextButton = screen.getByLabelText('Next chapter');
      const prevButton = screen.getByLabelText('Previous chapter');

      fireEvent.click(nextButton);
      expect(mockLoadChapter).toHaveBeenCalledWith(mockChapter.book, mockChapter.chapter + 1);

      fireEvent.click(prevButton);
      expect(mockLoadChapter).toHaveBeenCalledWith(mockChapter.book, mockChapter.chapter - 1);
    });
  });

  describe('Verse Interaction', () => {
    it('handles verse highlighting', async () => {
      const mockHighlightVerse = vi.fn();
      const mockUnhighlightVerse = vi.fn();
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: mockHighlightVerse,
        unhighlightVerse: mockUnhighlightVerse,
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      const highlightButton = screen.getAllByLabelText('Highlight verse')[0];
      fireEvent.click(highlightButton);

      expect(mockHighlightVerse).toHaveBeenCalledWith(mockChapter.verses[0].id);
    });

    it('handles verse bookmarking', async () => {
      const mockBookmarkVerse = vi.fn();
      const mockUnbookmarkVerse = vi.fn();
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: mockBookmarkVerse,
        unbookmarkVerse: mockUnbookmarkVerse,
        highlightedVerses: [],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      const bookmarkButton = screen.getAllByLabelText('Bookmark verse')[0];
      fireEvent.click(bookmarkButton);

      expect(mockBookmarkVerse).toHaveBeenCalledWith(mockChapter.verses[0].id);
    });

    it('toggles verse highlighting', async () => {
      const mockHighlightVerse = vi.fn();
      const mockUnhighlightVerse = vi.fn();
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: mockHighlightVerse,
        unhighlightVerse: mockUnhighlightVerse,
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
        highlightedVerses: [mockChapter.verses[0].id],
        bookmarkedVerses: [],
      });

      renderWithBibleProvider(<ReadingView />);
      
      const highlightButton = screen.getAllByLabelText('Highlight verse')[0];
      fireEvent.click(highlightButton);

      expect(mockUnhighlightVerse).toHaveBeenCalledWith(mockChapter.verses[0].id);
    });

    it('toggles verse bookmarking', async () => {
      const mockBookmarkVerse = vi.fn();
      const mockUnbookmarkVerse = vi.fn();
      vi.mocked(useBible).mockReturnValue({
        currentChapter: mockChapter,
        currentVerse: null,
        isLoading: false,
        error: null,
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: vi.fn(),
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: mockBookmarkVerse,
        unbookmarkVerse: mockUnbookmarkVerse,
        highlightedVerses: [],
        bookmarkedVerses: [mockChapter.verses[0].id],
      });

      renderWithBibleProvider(<ReadingView />);
      
      const bookmarkButton = screen.getAllByLabelText('Bookmark verse')[0];
      fireEvent.click(bookmarkButton);

      expect(mockUnbookmarkVerse).toHaveBeenCalledWith(mockChapter.verses[0].id);
    });
  });
}); 