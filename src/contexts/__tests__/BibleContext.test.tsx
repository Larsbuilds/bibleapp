import { renderHook, act } from '@testing-library/react';
import { BibleProvider, useBible } from '../BibleContext';
import { server } from '@/test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BibleProvider>{children}</BibleProvider>
);

describe('BibleContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useBible(), { wrapper });

    expect(result.current.currentVerse).toBeNull();
    expect(result.current.currentChapter).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches and sets a verse', async () => {
    const { result } = renderHook(() => useBible(), { wrapper });

    await act(async () => {
      await result.current.setCurrentVerse({ book: 'John', chapter: 3, verse: 16 });
    });

    expect(result.current.currentVerse).toBeDefined();
    expect(result.current.currentVerse?.reference).toBe('John 3:16');
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches and sets a chapter', async () => {
    const { result } = renderHook(() => useBible(), { wrapper });

    await act(async () => {
      await result.current.setCurrentChapter('John', 3);
    });

    expect(result.current.currentChapter).toBeDefined();
    expect(result.current.currentChapter?.book).toBe('John');
    expect(result.current.currentChapter?.chapter).toBe(3);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors', async () => {
    server.use(
      http.get('/api/bible/verse/:reference', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useBible(), { wrapper });

    await act(async () => {
      await result.current.setCurrentVerse({ book: 'John', chapter: 3, verse: 16 });
    });

    expect(result.current.error).toBe('Failed to fetch verse');
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error', async () => {
    const { result } = renderHook(() => useBible(), { wrapper });

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
}); 