import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { BibleProvider, useBible } from '@/contexts/BibleContext';
import { bibleService } from '@/services/bibleService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the bibleService
vi.mock('@/services/bibleService', () => ({
  bibleService: {
    getBooks: vi.fn(),
    getChapterCount: vi.fn(),
  },
}));

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
      highlightedVerses: [],
      bookmarkedVerses: [],
      setCurrentChapter: vi.fn(),
      setCurrentVerse: vi.fn(),
      loadChapter: vi.fn(),
      highlightVerse: vi.fn(),
      unhighlightVerse: vi.fn(),
      bookmarkVerse: vi.fn(),
      unbookmarkVerse: vi.fn(),
    })),
  };
});

describe('Sidebar', () => {
  const mockBooks = ['Genesis', 'Exodus', 'Leviticus'];
  const mockChapterCount = 50;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders sidebar with title and proper ARIA role', () => {
      render(<Sidebar />);
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      render(<Sidebar className="custom-class" />);
      expect(screen.getByRole('complementary')).toHaveClass('custom-class');
    });
  });

  describe('Books Loading', () => {
    it('shows loading state while fetching books', async () => {
      (bibleService.getBooks as jest.Mock).mockImplementation(() => new Promise(() => {}));
      render(<Sidebar />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('loads and displays books list', async () => {
      (bibleService.getBooks as jest.Mock).mockResolvedValue(mockBooks);

      render(<Sidebar />);

      await waitFor(() => {
        mockBooks.forEach(book => {
          expect(screen.getByRole('button', { name: book })).toBeInTheDocument();
        });
      });
    });

    it('handles error when loading books', async () => {
      const errorMessage = 'Failed to load books';
      (bibleService.getBooks as jest.Mock).mockRejectedValue(new Error(errorMessage));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Book Selection', () => {
    beforeEach(() => {
      (bibleService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      (bibleService.getChapterCount as jest.Mock).mockResolvedValue(mockChapterCount);
    });

    it('handles book selection and shows loading state for chapters', async () => {
      (bibleService.getChapterCount as jest.Mock).mockImplementation(() => new Promise(() => {}));
      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Genesis'));
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('loads and displays chapter buttons when book is selected', async () => {
      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Genesis'));

      await waitFor(() => {
        for (let i = 1; i <= 5; i++) { // Test first few chapters
          expect(screen.getByRole('button', { name: `Chapter ${i}` })).toBeInTheDocument();
        }
      });
    });

    it('handles error when loading chapter count', async () => {
      const errorMessage = 'Failed to load chapter count';
      (bibleService.getChapterCount as jest.Mock).mockRejectedValue(new Error(errorMessage));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Genesis'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('updates selected book visual state', async () => {
      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      const bookButton = screen.getByText('Genesis');
      fireEvent.click(bookButton);

      expect(bookButton).toHaveClass('bg-primary');
      expect(bookButton).toHaveClass('text-primary-content');
    });
  });

  describe('Chapter Selection', () => {
    const mockLoadChapter = vi.fn();

    beforeEach(() => {
      (bibleService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      (bibleService.getChapterCount as jest.Mock).mockResolvedValue(mockChapterCount);
      vi.mocked(useBible).mockReturnValue({
        currentChapter: null,
        currentVerse: null,
        isLoading: false,
        error: null,
        highlightedVerses: [],
        bookmarkedVerses: [],
        setCurrentChapter: vi.fn(),
        setCurrentVerse: vi.fn(),
        loadChapter: mockLoadChapter,
        highlightVerse: vi.fn(),
        unhighlightVerse: vi.fn(),
        bookmarkVerse: vi.fn(),
        unbookmarkVerse: vi.fn(),
      });
    });

    it('calls loadChapter when chapter is selected', async () => {
      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Genesis'));

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1'));
      expect(mockLoadChapter).toHaveBeenCalledWith('Genesis', 1);
    });

    it('handles error when loading chapter', async () => {
      const errorMessage = 'Failed to load chapter';
      mockLoadChapter.mockRejectedValue(new Error(errorMessage));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Genesis'));
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (bibleService.getBooks as jest.Mock).mockResolvedValue(mockBooks);
      (bibleService.getChapterCount as jest.Mock).mockResolvedValue(mockChapterCount);
    });

    it('has proper heading hierarchy', () => {
      render(<Sidebar />);
      expect(screen.getByRole('heading', { name: 'Books', level: 2 })).toBeInTheDocument();
    });

    it('provides accessible buttons for books and chapters', async () => {
      render(<Sidebar />);

      await waitFor(() => {
        mockBooks.forEach(book => {
          expect(screen.getByRole('button', { name: book })).toHaveAttribute('aria-label', book);
        });
      });

      fireEvent.click(screen.getByText('Genesis'));

      await waitFor(() => {
        for (let i = 1; i <= 5; i++) {
          const chapterButton = screen.getByRole('button', { name: i.toString() });
          expect(chapterButton).toHaveAttribute('aria-label', `Chapter ${i}`);
        }
      });
    });
  });
}); 