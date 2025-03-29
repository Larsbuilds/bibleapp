import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';
import { vi, describe, it, expect } from 'vitest';

interface NavigationLink {
  name: RegExp;
  href: string;
  text: string;
}

const navigationLinks: NavigationLink[] = [
  { name: /reading/i, href: '/reading', text: 'Reading' },
  { name: /search/i, href: '/search', text: 'Search' },
  { name: /bookmarks/i, href: '/bookmarks', text: 'Bookmarks' }
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  describe('Layout and Structure', () => {
    it('renders with correct base styling', () => {
      renderWithRouter(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-16', 'bg-base-100', 'border-b', 'border-base-300');
      
      const container = within(header).getByTestId('header-container');
      expect(container).toHaveClass('h-full', 'px-4', 'flex', 'items-center', 'justify-between');
    });

    it('has responsive navigation layout', () => {
      renderWithRouter(<Header />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden', 'md:flex', 'gap-4');
    });
  });

  describe('Brand and Navigation', () => {
    it('renders app title with correct link and styling', () => {
      renderWithRouter(<Header />);
      
      const titleLink = screen.getByRole('link', { name: /bible app/i });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', '/');
      expect(titleLink).toHaveClass('text-xl', 'font-bold');
    });

    it('renders all navigation links with correct attributes', () => {
      renderWithRouter(<Header />);
      
      navigationLinks.forEach(link => {
        const linkElement = screen.getByRole('link', { name: link.name });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', link.href);
        expect(linkElement).toHaveClass('btn', 'btn-ghost', 'btn-sm');
        expect(linkElement).toHaveTextContent(link.text);
      });
    });

    it('maintains correct navigation order', () => {
      renderWithRouter(<Header />);
      
      const navItems = screen.getAllByRole('link');
      expect(navItems).toHaveLength(4); // Home + 3 nav links
      
      expect(navItems[0]).toHaveTextContent(/bible app/i);
      navigationLinks.forEach((link, index) => {
        expect(navItems[index + 1]).toHaveTextContent(link.text);
      });
    });
  });

  describe('Action Buttons', () => {
    it('renders theme toggle button with correct attributes', () => {
      renderWithRouter(<Header />);
      
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toBeInTheDocument();
      expect(themeButton).toHaveClass('btn', 'btn-ghost', 'btn-circle');
      
      const themeIcon = within(themeButton).getByRole('presentation');
      expect(themeIcon).toHaveClass('h-5', 'w-5');
    });

    it('renders user menu button with correct attributes', () => {
      renderWithRouter(<Header />);
      
      const userButton = screen.getByRole('button', { name: /user menu/i });
      expect(userButton).toBeInTheDocument();
      expect(userButton).toHaveClass('btn', 'btn-ghost', 'btn-circle');
      
      const userIcon = within(userButton).getByRole('presentation');
      expect(userIcon).toHaveClass('h-5', 'w-5');
    });

    it('renders action buttons in correct order', () => {
      renderWithRouter(<Header />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      expect(buttons[0]).toHaveAccessibleName(/toggle theme/i);
      expect(buttons[1]).toHaveAccessibleName(/user menu/i);
    });
  });
}); 