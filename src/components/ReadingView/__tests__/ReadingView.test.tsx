import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReadingView } from '../ReadingView';
import { BibleProvider } from '../../../contexts/BibleContext';
import { mockVerse } from '../../../test-utils/mockData';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <BibleProvider>
        {component}
      </BibleProvider>
    </BrowserRouter>
  );
};

describe('ReadingView', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<ReadingView />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    renderWithProviders(<ReadingView />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('renders chapter content when loaded', () => {
    renderWithProviders(<ReadingView />);
    expect(screen.getByText(mockVerse.text)).toBeInTheDocument();
  });
}); 