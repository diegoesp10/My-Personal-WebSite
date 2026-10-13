import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Fonts are bundled locally: no requests to third-party font services.
import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/visits.css';
import './styles/error.css';
import './styles/legal.css';
import './styles/home.css';
import './styles/motion.css';
import './styles/motion-gsap.css';
import './styles/editor.css';
import './styles/print.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
