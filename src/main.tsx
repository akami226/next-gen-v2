import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './hooks/useTheme';
import App from './App.tsx';
import './index.css';
import { validateEnvironment } from './lib/envValidation';
import { ErrorBoundary } from './components/ErrorBoundary';

// Validate environment variables on startup
validateEnvironment();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
