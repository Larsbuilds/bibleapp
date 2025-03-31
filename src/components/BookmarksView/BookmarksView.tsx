import React, { useState, useEffect, useCallback } from 'react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { BibleVerse } from '@/components/BibleVerse/BibleVerse';
import { bibleService } from '@/services/bibleService';
import { Verse } from '@/types/bible';
import { useBible } from '@/contexts/BibleContext';
import { useNavigate } from 'react-router-dom';

const UNSAVED_NOTES_KEY = 'bible_unsaved_notes';

export const BookmarksView: React.FC = () => {
  const { bookmarks, isLoading, error, removeBookmark, updateBookmark } = useBookmarks();
  const { setCurrentChapter, setCurrentVerse } = useBible();
  const navigate = useNavigate();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  // Initialize notes from bookmarks and localStorage
  useEffect(() => {
    try {
      // First, initialize notes from existing bookmarks
      const bookmarkNotes = bookmarks.reduce((acc, bookmark) => {
        if (bookmark.note) {
          acc[bookmark.id] = bookmark.note;
        }
        return acc;
      }, {} as { [key: string]: string });

      // Then, load any unsaved notes from localStorage
      const stored = localStorage.getItem(UNSAVED_NOTES_KEY);
      const unsavedNotes = stored ? JSON.parse(stored) : {};

      // Merge bookmark notes with unsaved notes, preferring unsaved notes
      setNotes({ ...bookmarkNotes, ...unsavedNotes });
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  }, [bookmarks]);

  useEffect(() => {
    const loadVerses = async () => {
      try {
        setLoadingVerses(true);
        const versePromises = bookmarks.map(async (bookmark) => {
          const [book, chapter, verse] = bookmark.verseId.split('-');
          return bibleService.getVerse({ book, chapter: parseInt(chapter), verse: parseInt(verse) });
        });
        const loadedVerses = await Promise.all(versePromises);
        setVerses(loadedVerses);
      } catch (err) {
        console.error('Error loading verses:', err);
      } finally {
        setLoadingVerses(false);
      }
    };

    if (bookmarks.length > 0) {
      loadVerses();
    } else {
      setLoadingVerses(false);
    }
  }, [bookmarks]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId);
      // Remove note when bookmark is removed
      setNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[bookmarkId];
        localStorage.setItem(UNSAVED_NOTES_KEY, JSON.stringify(newNotes));
        return newNotes;
      });
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleNoteChange = (bookmarkId: string, value: string) => {
    const newNotes = { ...notes, [bookmarkId]: value };
    setNotes(newNotes);
    localStorage.setItem(UNSAVED_NOTES_KEY, JSON.stringify(newNotes));
  };

  const handleSaveNote = async (bookmarkId: string) => {
    try {
      setSaving(prev => ({ ...prev, [bookmarkId]: true }));
      const updatedBookmark = await updateBookmark(bookmarkId, notes[bookmarkId] || '');
      
      // Update local state with the saved note
      setNotes(prev => {
        const newNotes = { ...prev };
        if (updatedBookmark.note) {
          newNotes[bookmarkId] = updatedBookmark.note;
        } else {
          delete newNotes[bookmarkId];
        }
        localStorage.setItem(UNSAVED_NOTES_KEY, JSON.stringify(newNotes));
        return newNotes;
      });
    } catch (err) {
      console.error('Error updating note:', err);
    } finally {
      setSaving(prev => ({ ...prev, [bookmarkId]: false }));
    }
  };

  const handleVerseClick = async (verse: Verse) => {
    try {
      await setCurrentChapter(verse.book, verse.chapter);
      await setCurrentVerse({ book: verse.book, chapter: verse.chapter, verse: verse.verse });
      navigate('/reading');
    } catch (err) {
      console.error('Error navigating to verse:', err);
    }
  };

  if (isLoading || loadingVerses) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
        <p className="text-base-content/70">
          When you bookmark verses while reading, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Bookmarks</h1>
      <div className="space-y-4">
        {bookmarks.map((bookmark) => {
          const verse = verses.find((v) => v.id === bookmark.verseId);
          if (!verse) return null;

          return (
            <div 
              key={bookmark.id} 
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
              onClick={() => handleVerseClick(verse)}
            >
              <div className="card-body">
                <BibleVerse
                  verse={verse}
                />
                <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Add a note..."
                    value={notes[bookmark.id] || ''}
                    onChange={(e) => handleNoteChange(bookmark.id, e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      className={`btn btn-primary btn-sm ${saving[bookmark.id] ? 'loading' : ''}`}
                      onClick={() => handleSaveNote(bookmark.id)}
                      disabled={saving[bookmark.id]}
                    >
                      {saving[bookmark.id] ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 