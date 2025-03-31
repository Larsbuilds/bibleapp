import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BibleProvider } from '@/contexts/BibleContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReadingView } from '@/components/ReadingView/ReadingView';
import { SearchView } from '@/components/SearchView/SearchView';
import { BookmarksView } from '@/components/BookmarksView/BookmarksView';
import { Header } from '@/components/Navigation/Header';
import { Sidebar } from '@/components/Navigation/Sidebar';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <BibleProvider>
          <SearchProvider>
            <BookmarkProvider>
              <div className="min-h-screen bg-base-200">
                <Header />
                <div className="flex h-[calc(100vh-4rem)]">
                  <Sidebar className="w-64 border-r border-base-300" />
                  <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                      <Route path="/" element={<ReadingView />} />
                      <Route path="/reading" element={<ReadingView />} />
                      <Route path="/search" element={<SearchView />} />
                      <Route path="/bookmarks" element={<BookmarksView />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </BookmarkProvider>
          </SearchProvider>
        </BibleProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
