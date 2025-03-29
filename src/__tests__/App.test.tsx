import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByText('Bible App')).toBeInTheDocument();
  });

  it('redirects to reading view when accessing root path', () => {
    renderApp();
    expect(window.location.pathname).toBe('/reading');
  });

  it('renders reading view when accessing /reading', () => {
    renderApp();
    expect(screen.getByText('Welcome to Bible App')).toBeInTheDocument();
  });

  it('redirects to reading view for unknown paths', () => {
    window.history.pushState({}, '', '/unknown');
    renderApp();
    expect(window.location.pathname).toBe('/reading');
  });
}); 