import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { Header } from '@/components/Navigation/Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar className="w-64 border-r border-base-300" />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 