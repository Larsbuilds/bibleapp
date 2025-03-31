import React, { useState, useEffect } from 'react';
import { useBible } from '@/contexts/BibleContext';
import { bibleService } from '@/services/bibleService';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [books, setBooks] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [chapterCount, setChapterCount] = useState<number>(0);
  const { setCurrentChapter, setCurrentVerse } = useBible();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const bookList = await bibleService.getBooks();
        setBooks(bookList);
      } catch (error) {
        console.error('Failed to load books:', error);
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const loadChapterCount = async () => {
      if (selectedBook) {
        try {
          const count = await bibleService.getChapterCount(selectedBook);
          setChapterCount(count);
        } catch (error) {
          console.error('Failed to load chapter count:', error);
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
        await setCurrentChapter(selectedBook, chapter);
        await setCurrentVerse({ book: selectedBook, chapter, verse: 1 });
        navigate('/reading');
      } catch (error) {
        console.error('Error navigating to chapter:', error);
      }
    }
  };

  return (
    <aside className={`bg-base-100 overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Books</h2>
        <div className="space-y-2">
          {books.map((book) => (
            <div key={book}>
              <button
                onClick={() => handleBookSelect(book)}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  selectedBook === book ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
                }`}
              >
                {book}
              </button>
              {selectedBook === book && (
                <div className="ml-4 mt-2 grid grid-cols-5 gap-1">
                  {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => handleChapterSelect(chapter)}
                      className="btn btn-xs btn-ghost"
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}; 