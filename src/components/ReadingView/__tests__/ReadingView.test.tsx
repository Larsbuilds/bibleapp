import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReadingView } from '../ReadingView';
import { BibleProvider } from '@/contexts/BibleContext';
import { Verse } from '@/types/bible';

const mockChapter = {
  book: 'John',
  chapter: 3,
  verses: [
    {
      id: 'john-3-16',
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      book: 'John',
      chapter: 3,
      verse: 16,
      translation: 'NIV'
    },
    {
      id: 'john-3-17',
      reference: 'John 3:17',
      text: 'For God did not send his Son...',
      book: 'John',
      chapter: 3,
      verse: 17,
      translation: 'NIV'
    }
  ]
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <BibleProvider>{ui}</BibleProvider>
    </BrowserRouter>
  );
};

describe('ReadingView', () => {
  it('shows welcome message when no chapter is selected', () => {
    renderWithProviders(<ReadingView />);
    
    expect(screen.getByText('Welcome to Bible App')).toBeInTheDocument();
    expect(screen.getByText(/Select a book and chapter from the sidebar/)).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    // Mock the BibleContext to show loading state
    jest.spyOn(require('@/contexts/BibleContext'), 'useBible').mockReturnValue({
      currentChapter: null,
      isLoading: true,
      error: null
    });

    renderWithProviders(<ReadingView />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    const errorMessage = 'Failed to load chapter';
    // Mock the BibleContext to show error state
    jest.spyOn(require('@/contexts/BibleContext'), 'useBible').mockReturnValue({
      currentChapter: null,
      isLoading: false,
      error: errorMessage
    });

    renderWithProviders(<ReadingView />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays chapter content when loaded', () => {
    // Mock the BibleContext to show chapter content
    jest.spyOn(require('@/contexts/BibleContext'), 'useBible').mockReturnValue({
      currentChapter: mockChapter,
      isLoading: false,
      error: null
    });

    renderWithProviders(<ReadingView />);
    
    expect(screen.getByText('John Chapter 3')).toBeInTheDocument();
    expect(screen.getByText('For God so loved the world...')).toBeInTheDocument();
    expect(screen.getByText('For God did not send his Son...')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    // Mock the BibleContext to show chapter content
    jest.spyOn(require('@/contexts/BibleContext'), 'useBible').mockReturnValue({
      currentChapter: mockChapter,
      isLoading: false,
      error: null
    });

    renderWithProviders(<ReadingView />);
    
    expect(screen.getByLabelText('Previous chapter')).toBeInTheDocument();
    expect(screen.getByLabelText('Next chapter')).toBeInTheDocument();
  });
}); 