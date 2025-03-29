import React, { useState, useEffect } from 'react';
import { useBible } from '@/contexts/BibleContext';
import { bibleService } from '@/services/bibleService';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [books, setBooks] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [chapterCount, setChapterCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const { setCurrentChapter, loadChapter } = useBible();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const bookList = await bibleService.getBooks();
        setBooks(bookList);
        setError(null);
      } catch (err) {
        setError('Failed to load books');
        console.error('Failed to load books:', err);
      } finally {
        setIsLoadingBooks(false);
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const loadChapterCount = async () => {
      if (selectedBook) {
        setIsLoadingChapters(true);
        try {
          const count = await bibleService.getChapterCount(selectedBook);
          setChapterCount(count);
          setError(null);
        } catch (err) {
          setError('Failed to load chapter count');
          console.error('Failed to load chapter count:', err);
        } finally {
          setIsLoadingChapters(false);
        }
      }
    };
    loadChapterCount();
  }, [selectedBook]);

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
  };

  const handleChapterSelect = async (chapter: number) => {
    if (selectedBook) {
      try {
        await loadChapter(selectedBook, chapter);
      } catch (err) {
        setError('Failed to load chapter');
        console.error('Failed to load chapter:', err);
      }
    }
  };

  return (
    <aside className={`bg-base-100 overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Books</h2>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        {isLoadingBooks ? (
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg" role="progressbar"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {books.map((book) => (
              <div key={book}>
                <button
                  onClick={() => handleBookSelect(book)}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    selectedBook === book ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
                  }`}
                  aria-label={book}
                >
                  {book}
                </button>
                {selectedBook === book && (
                  <div className="ml-4 mt-2">
                    {isLoadingChapters ? (
                      <div className="flex justify-center">
                        <div className="loading loading-spinner loading-md" role="progressbar"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => (
                          <button
                            key={chapter}
                            onClick={() => handleChapterSelect(chapter)}
                            className="btn btn-xs btn-ghost"
                            aria-label={`Chapter ${chapter}`}
                          >
                            {chapter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}; 