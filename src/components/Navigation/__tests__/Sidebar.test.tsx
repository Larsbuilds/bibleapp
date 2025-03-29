import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { BibleProvider } from '@/contexts/BibleContext';
import { server } from '@/test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

const mockBooks = ['Genesis', 'Exodus', 'Leviticus'];
const mockChapterCount = 50;

// Add handlers for books and chapter count
server.use(
  http.get('/api/bible/books', () => {
    return HttpResponse.json(mockBooks);
  }),
  http.get('/api/bible/books/:book/chapters', () => {
    return HttpResponse.json(mockChapterCount);
  })
);

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <BibleProvider>{ui}</BibleProvider>
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  it('renders the books section', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('loads and displays books', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      mockBooks.forEach(book => {
        expect(screen.getByText(book)).toBeInTheDocument();
      });
    });
  });

  it('shows chapter buttons when a book is selected', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Genesis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Genesis'));

    await waitFor(() => {
      // Check if chapter buttons are rendered
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('applies correct styling to selected book', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Genesis')).toBeInTheDocument();
    });

    const genesisButton = screen.getByText('Genesis');
    fireEvent.click(genesisButton);

    expect(genesisButton.closest('button')).toHaveClass('bg-primary');
  });

  it('handles API errors gracefully', async () => {
    // Override the handler to simulate an error
    server.use(
      http.get('/api/bible/books', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(<Sidebar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load books:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
}); 