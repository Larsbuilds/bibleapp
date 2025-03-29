import { render, screen, fireEvent } from '@testing-library/react';
import { BibleVerse } from '../BibleVerse';
import { BibleProvider } from '@/contexts/BibleContext';
import { Verse } from '@/types/bible';

const mockVerse: Verse = {
  id: 'john-3-16',
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  book: 'John',
  chapter: 3,
  verse: 16,
  translation: 'NIV'
};

const renderWithBibleProvider = (ui: React.ReactElement) => {
  return render(<BibleProvider>{ui}</BibleProvider>);
};

describe('BibleVerse', () => {
  it('renders verse text and reference', () => {
    renderWithBibleProvider(
      <BibleVerse verse={mockVerse} />
    );

    expect(screen.getByText('John 3:16')).toBeInTheDocument();
    expect(screen.getByText('For God so loved the world...')).toBeInTheDocument();
  });

  it('calls onHighlight when highlight button is clicked', () => {
    const onHighlight = jest.fn();
    renderWithBibleProvider(
      <BibleVerse verse={mockVerse} onHighlight={onHighlight} />
    );

    fireEvent.click(screen.getByLabelText('Highlight verse'));
    expect(onHighlight).toHaveBeenCalledWith(mockVerse.id);
  });

  it('calls onBookmark when bookmark button is clicked', () => {
    const onBookmark = jest.fn();
    renderWithBibleProvider(
      <BibleVerse verse={mockVerse} onBookmark={onBookmark} />
    );

    fireEvent.click(screen.getByLabelText('Bookmark verse'));
    expect(onBookmark).toHaveBeenCalledWith(mockVerse.id);
  });

  it('applies highlight background when verse is current verse', () => {
    renderWithBibleProvider(
      <BibleVerse verse={mockVerse} />
    );

    const verseElement = screen.getByText('John 3:16').closest('div');
    expect(verseElement).toHaveClass('bg-base-100');
  });
}); 