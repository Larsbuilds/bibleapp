/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react';
import { BibleProvider, useBible } from '@/contexts/BibleContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the bibleService module
vi.mock('@/services/bibleService', () => ({
  bibleService: {
    getChapter: vi.fn(),
    getVerse: vi.fn(),
    searchVerses: vi.fn(),
  },
}));

// Import after mocking
import { bibleService } from '@/services/bibleService';

describe('BibleContext', () => {
  const mockVerse = {
    id: 'john-3-16',
    book: 'John',
    chapter: 3,
    verse: 16,
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    translation: 'NIV'
  };

  const mockChapter = {
    book: 'John',
    chapter: 3,
    verses: [mockVerse]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    expect(result.current.currentChapter).toBeNull();
    expect(result.current.currentVerse).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.highlightedVerses).toEqual([]);
    expect(result.current.bookmarkedVerses).toEqual([]);
  });

  it('loads chapter successfully', async () => {
    vi.mocked(bibleService.getChapter).mockResolvedValueOnce(mockChapter);

    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    await act(async () => {
      await result.current.loadChapter('John', 3);
    });

    expect(bibleService.getChapter).toHaveBeenCalledWith('John', 3);
    expect(result.current.currentChapter).toEqual(mockChapter);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles chapter loading error', async () => {
    const error = new Error('Failed to load chapter');
    vi.mocked(bibleService.getChapter).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    await act(async () => {
      await result.current.loadChapter('John', 3);
    });

    expect(bibleService.getChapter).toHaveBeenCalledWith('John', 3);
    expect(result.current.currentChapter).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to load chapter');
  });

  it('manages verse highlighting', () => {
    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    act(() => {
      result.current.highlightVerse('john-3-16');
    });

    expect(result.current.highlightedVerses).toContain('john-3-16');

    act(() => {
      result.current.unhighlightVerse('john-3-16');
    });

    expect(result.current.highlightedVerses).not.toContain('john-3-16');
  });

  it('manages verse bookmarking', () => {
    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    act(() => {
      result.current.bookmarkVerse('john-3-16');
    });

    expect(result.current.bookmarkedVerses).toContain('john-3-16');

    act(() => {
      result.current.unbookmarkVerse('john-3-16');
    });

    expect(result.current.bookmarkedVerses).not.toContain('john-3-16');
  });

  it('sets current verse', () => {
    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    act(() => {
      result.current.setCurrentVerse(mockVerse);
    });

    expect(result.current.currentVerse).toEqual(mockVerse);
  });

  it('sets current chapter', () => {
    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    act(() => {
      result.current.setCurrentChapter(mockChapter);
    });

    expect(result.current.currentChapter).toEqual(mockChapter);
  });

  it('handles loading state during chapter load', async () => {
    let resolvePromise: (value: unknown) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(bibleService.getChapter).mockImplementationOnce(() => loadingPromise as Promise<any>);

    const { result } = renderHook(() => useBible(), {
      wrapper: ({ children }) => <BibleProvider>{children}</BibleProvider>
    });

    let loadChapterPromise: Promise<void>;
    act(() => {
      loadChapterPromise = result.current.loadChapter('John', 3);
    });

    // Loading state should be true immediately after starting
    expect(result.current.isLoading).toBe(true);

    // Resolve the loading
    await act(async () => {
      resolvePromise!(mockChapter);
      await loadChapterPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentChapter).toEqual(mockChapter);
  });
}); 