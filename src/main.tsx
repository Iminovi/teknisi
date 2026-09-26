import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure fetch is settable if an environment script attempts window.fetch = ...
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || (!desc.writable && !desc.set)) {
      const origFetch = window.fetch.bind(window);
      let activeFetch = origFetch;
      Object.defineProperty(window, 'fetch', {
        get: () => activeFetch,
        set: (v) => {
          activeFetch = typeof v === 'function' ? v : origFetch;
        },
        configurable: true,
        enumerable: true,
      });
    }
  }
} catch {
  // Ignore descriptor errors
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
