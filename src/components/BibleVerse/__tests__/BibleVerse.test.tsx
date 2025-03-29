import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BibleVerse } from '../BibleVerse';
import { BibleProvider } from '@/contexts/BibleContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockVerse = {
  book: 'John',
  chapter: 3,
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  translation: 'NIV',
  verse: 16,
};

// Create mock functions
const mockHighlightVerse = vi.fn();
const mockUnhighlightVerse = vi.fn();
const mockBookmarkVerse = vi.fn();
const mockUnbookmarkVerse = vi.fn();
const mockSetCurrentVerse = vi.fn();
const mockSetCurrentChapter = vi.fn();
const mockLoadChapter = vi.fn();

// Create mock context state
type BibleContextState = {
  currentVerse: typeof mockVerse | null;
  currentChapter: { book: string; chapter: number; verses: typeof mockVerse[] } | null;
  isLoading: boolean;
  error: string | null;
  highlightedVerses: string[];
  bookmarkedVerses: string[];
  setCurrentVerse: typeof mockSetCurrentVerse;
  setCurrentChapter: typeof mockSetCurrentChapter;
  loadChapter: typeof mockLoadChapter;
  highlightVerse: typeof mockHighlightVerse;
  unhighlightVerse: typeof mockUnhighlightVerse;
  bookmarkVerse: typeof mockBookmarkVerse;
  unbookmarkVerse: typeof mockUnbookmarkVerse;
};

let mockContextState: BibleContextState = {
  currentVerse: null,
  currentChapter: null,
  isLoading: false,
  error: null,
  highlightedVerses: [],
  bookmarkedVerses: [],
  setCurrentVerse: mockSetCurrentVerse,
  setCurrentChapter: mockSetCurrentChapter,
  loadChapter: mockLoadChapter,
  highlightVerse: mockHighlightVerse,
  unhighlightVerse: mockUnhighlightVerse,
  bookmarkVerse: mockBookmarkVerse,
  unbookmarkVerse: mockUnbookmarkVerse,
};

// Mock the BibleContext
vi.mock('@/contexts/BibleContext', () => ({
  useBible: () => mockContextState,
  BibleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import after mocking
import { useBible } from '@/contexts/BibleContext';

describe('BibleVerse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContextState = {
      currentVerse: null,
      currentChapter: null,
      isLoading: false,
      error: null,
      highlightedVerses: [],
      bookmarkedVerses: [],
      setCurrentVerse: mockSetCurrentVerse,
      setCurrentChapter: mockSetCurrentChapter,
      loadChapter: mockLoadChapter,
      highlightVerse: mockHighlightVerse,
      unhighlightVerse: mockUnhighlightVerse,
      bookmarkVerse: mockBookmarkVerse,
      unbookmarkVerse: mockUnbookmarkVerse,
    };
  });

  const renderWithBibleProvider = (ui: React.ReactElement) => {
    return render(
      <BibleProvider>
        {ui}
      </BibleProvider>
    );
  };

  it('renders verse text and reference', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByText(mockVerse.text)).toBeInTheDocument();
    expect(screen.getByText(mockVerse.reference)).toBeInTheDocument();
  });

  it('handles verse highlighting interaction', () => {
    // Initial render with no highlights
    const { rerender } = renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    const highlightButton = screen.getByRole('button', { name: /highlight verse/i });
    
    // Test highlighting
    fireEvent.click(highlightButton);
    expect(mockHighlightVerse).toHaveBeenCalledWith(mockVerse.id);
    
    // Update context and re-render for unhighlighting test
    mockContextState = {
      ...mockContextState,
      highlightedVerses: [mockVerse.id],
    };
    rerender(<BibleProvider><BibleVerse verse={mockVerse} /></BibleProvider>);
    
    // Test unhighlighting
    fireEvent.click(highlightButton);
    expect(mockUnhighlightVerse).toHaveBeenCalledWith(mockVerse.id);
  });

  it('handles verse bookmarking interaction', () => {
    // Initial render with no bookmarks
    const { rerender } = renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    const bookmarkButton = screen.getByRole('button', { name: /bookmark verse/i });
    
    // Test bookmarking
    fireEvent.click(bookmarkButton);
    expect(mockBookmarkVerse).toHaveBeenCalledWith(mockVerse.id);
    
    // Update context and re-render for unbookmarking test
    mockContextState = {
      ...mockContextState,
      bookmarkedVerses: [mockVerse.id],
    };
    rerender(<BibleProvider><BibleVerse verse={mockVerse} /></BibleProvider>);
    
    // Test unbookmarking
    fireEvent.click(bookmarkButton);
    expect(mockUnbookmarkVerse).toHaveBeenCalledWith(mockVerse.id);
  });

  it('handles verse sharing interaction', () => {
    const mockShare = vi.fn();
    renderWithBibleProvider(<BibleVerse verse={mockVerse} onShare={mockShare} />);
    const shareButton = screen.getByRole('button', { name: /share verse/i });
    
    fireEvent.click(shareButton);
    expect(mockShare).toHaveBeenCalledWith(mockVerse);
  });

  it('applies highlight class when verse is highlighted', () => {
    mockContextState = {
      ...mockContextState,
      highlightedVerses: [mockVerse.id],
    };
    
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByTestId('verse-container')).toHaveClass('bg-primary/10');
  });

  it('applies highlight class when verse is current verse', () => {
    mockContextState = {
      ...mockContextState,
      currentVerse: mockVerse,
    };
    
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByTestId('verse-container')).toHaveClass('bg-primary/10');
  });

  it('applies highlight class when verse is highlighted via prop', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} isHighlighted={true} />);
    expect(screen.getByTestId('verse-container')).toHaveClass('bg-primary/10');
  });

  it('displays translation information when available', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByText(mockVerse.translation)).toBeInTheDocument();
  });

  it('displays bookmark icon when verse is bookmarked', () => {
    mockContextState = {
      ...mockContextState,
      bookmarkedVerses: [mockVerse.id],
    };
    
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument();
  });

  it('displays bookmark icon when verse is bookmarked via prop', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} isBookmarked={true} />);
    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument();
  });

  it('does not display share button when onShare prop is not provided', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.queryByRole('button', { name: /share verse/i })).not.toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockContextState = {
      ...mockContextState,
      isLoading: true,
    };
    
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByTestId('verse-container')).toHaveClass('opacity-50');
  });

  it('handles error state', () => {
    mockContextState = {
      ...mockContextState,
      error: 'Failed to load verse',
    };
    
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    expect(screen.getByTestId('verse-container')).toHaveClass('border-error');
  });

  it('supports keyboard navigation', () => {
    renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    
    const highlightButton = screen.getByRole('button', { name: /highlight verse/i });
    const bookmarkButton = screen.getByRole('button', { name: /bookmark verse/i });
    
    // Test tab navigation
    highlightButton.focus();
    expect(document.activeElement).toBe(highlightButton);
    
    // Test enter key
    fireEvent.keyDown(highlightButton, { key: 'Enter' });
    expect(mockHighlightVerse).toHaveBeenCalledWith(mockVerse.id);
    
    // Test space key
    fireEvent.keyDown(bookmarkButton, { key: ' ' });
    expect(mockBookmarkVerse).toHaveBeenCalledWith(mockVerse.id);
  });

  it('handles long verse text with truncation', () => {
    const longVerse = {
      ...mockVerse,
      text: 'This is a very long verse text that should be truncated when it exceeds the maximum length of the container. '.repeat(5),
    };
    
    renderWithBibleProvider(<BibleVerse verse={longVerse} />);
    const verseText = screen.getByTestId('verse-container').querySelector('.truncate');
    expect(verseText).toBeInTheDocument();
    expect(verseText).toHaveClass('truncate');
  });

  it('handles different verse formats', () => {
    const verseWithHtml = {
      ...mockVerse,
      text: '<i>Italic text</i> and <b>bold text</b>',
    };
    
    const { container } = renderWithBibleProvider(<BibleVerse verse={verseWithHtml} />);
    expect(container.innerHTML).toContain('<i>Italic text</i>');
    expect(container.innerHTML).toContain('<b>bold text</b>');
  });

  it('maintains proper aria states', () => {
    const { rerender } = renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
    
    const highlightButton = screen.getByRole('button', { name: /highlight verse/i });
    const bookmarkButton = screen.getByRole('button', { name: /bookmark verse/i });
    
    // Test aria-pressed state for highlight button
    mockContextState = {
      ...mockContextState,
      highlightedVerses: [mockVerse.id],
    };
    rerender(<BibleProvider><BibleVerse verse={mockVerse} /></BibleProvider>);
    expect(highlightButton).toHaveAttribute('aria-pressed', 'true');
    
    // Test aria-pressed state for bookmark button
    mockContextState = {
      ...mockContextState,
      bookmarkedVerses: [mockVerse.id],
    };
    rerender(<BibleProvider><BibleVerse verse={mockVerse} /></BibleProvider>);
    expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles verse with missing translation', () => {
    const verseWithoutTranslation = {
      ...mockVerse,
      translation: '',
    };
    
    renderWithBibleProvider(<BibleVerse verse={verseWithoutTranslation} />);
    expect(screen.queryByText('NIV')).not.toBeInTheDocument();
  });

  it('handles verse with missing reference', () => {
    const verseWithoutReference = {
      ...mockVerse,
      reference: '',
    };
    
    renderWithBibleProvider(<BibleVerse verse={verseWithoutReference} />);
    expect(screen.queryByText('John 3:16')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation for highlight button', () => {
    try {
      renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
      const highlightButton = screen.getByRole('button', { name: /highlight verse/i });
      
      // Test Enter key
      fireEvent.keyDown(highlightButton, { key: 'Enter' });
      expect(mockHighlightVerse).toHaveBeenCalledWith(mockVerse.id);
      
      // Test Space key
      fireEvent.keyDown(highlightButton, { key: ' ' });
      expect(mockHighlightVerse).toHaveBeenCalledTimes(2);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('handles keyboard navigation for bookmark button', () => {
    try {
      renderWithBibleProvider(<BibleVerse verse={mockVerse} />);
      const bookmarkButton = screen.getByRole('button', { name: /bookmark verse/i });
      
      // Test Enter key
      fireEvent.keyDown(bookmarkButton, { key: 'Enter' });
      expect(mockBookmarkVerse).toHaveBeenCalledWith(mockVerse.id);
      
      // Test Space key
      fireEvent.keyDown(bookmarkButton, { key: ' ' });
      expect(mockBookmarkVerse).toHaveBeenCalledTimes(2);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
}); 