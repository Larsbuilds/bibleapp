import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Header', () => {
  it('renders the app title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Bible App')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
  });

  it('renders user action buttons', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    renderWithRouter(<Header />);
    
    const readingLink = screen.getByText('Reading').closest('a');
    const searchLink = screen.getByText('Search').closest('a');
    const bookmarksLink = screen.getByText('Bookmarks').closest('a');

    expect(readingLink).toHaveAttribute('href', '/reading');
    expect(searchLink).toHaveAttribute('href', '/search');
    expect(bookmarksLink).toHaveAttribute('href', '/bookmarks');
  });
}); 