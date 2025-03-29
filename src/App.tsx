import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ReadingView } from '@/components/ReadingView/ReadingView';
import { SearchView } from '@/components/SearchView/SearchView';
import { BibleProvider } from '@/contexts/BibleContext';
import { SearchProvider } from '@/contexts/SearchContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <BibleProvider>
        <SearchProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/reading" replace />} />
              <Route path="reading" element={<ReadingView />} />
              <Route path="search" element={<SearchView />} />
              {/* Add more routes as we implement features */}
              <Route path="*" element={<Navigate to="/reading" replace />} />
            </Route>
          </Routes>
        </SearchProvider>
      </BibleProvider>
    </BrowserRouter>
  );
};

export default App;
