import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchView } from '../SearchView';
import { SearchProvider } from '@/contexts/SearchContext';
import { server } from '@/test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

const mockSearchResults = {
  verses: [
    {
      id: 'john-3-16',
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      book: 'John',
      chapter: 3,
      verse: 16,
      translation: 'NIV'
    }
  ],
  total: 1,
  page: 1,
  pageSize: 20
};

const mockSearchHistory = ['love', 'faith', 'hope'];

// Add handlers for search and history
server.use(
  http.get('/api/bible/search', () => {
    return HttpResponse.json(mockSearchResults);
  }),
  http.get('/api/bible/search/history', () => {
    return HttpResponse.json(mockSearchHistory);
  })
);

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SearchProvider>{ui}</SearchProvider>
    </BrowserRouter>
  );
};

describe('SearchView', () => {
  it('renders search form', () => {
    renderWithProviders(<SearchView />);
    
    expect(screen.getByPlaceholderText('Search verses or enter a reference...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
  });

  it('loads and displays search history', async () => {
    renderWithProviders(<SearchView />);
    
    await waitFor(() => {
      mockSearchHistory.forEach(query => {
        expect(screen.getByText(query)).toBeInTheDocument();
      });
    });
  });

  it('performs search when form is submitted', async () => {
    renderWithProviders(<SearchView />);
    
    const searchInput = screen.getByPlaceholderText('Search verses or enter a reference...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'love' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Found 1 results')).toBeInTheDocument();
      expect(screen.getByText('For God so loved the world...')).toBeInTheDocument();
    });
  });

  it('toggles reference search mode', () => {
    renderWithProviders(<SearchView />);
    
    const referenceToggle = screen.getByRole('checkbox');
    expect(referenceToggle).not.toBeChecked();

    fireEvent.click(referenceToggle);
    expect(referenceToggle).toBeChecked();
  });

  it('shows loading state during search', async () => {
    // Override the handler to simulate a delay
    server.use(
      http.get('/api/bible/search', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json(mockSearchResults);
      })
    );

    renderWithProviders(<SearchView />);
    
    const searchInput = screen.getByPlaceholderText('Search verses or enter a reference...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'love' } });
    fireEvent.click(searchButton);

    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('handles search errors', async () => {
    // Override the handler to simulate an error
    server.use(
      http.get('/api/bible/search', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithProviders(<SearchView />);
    
    const searchInput = screen.getByPlaceholderText('Search verses or enter a reference...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'love' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to search')).toBeInTheDocument();
    });
  });
}); 