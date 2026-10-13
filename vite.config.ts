import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on 5080 (repository My-personal-Website-Back); PORTFOLIO_API points elsewhere,
// for example to the Docker API: PORTFOLIO_API=http://127.0.0.1:8081 npm run dev.
const api = process.env.PORTFOLIO_API ?? 'http://127.0.0.1:5080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': api, '/uploads': api, '/sitemap.xml': api },
  },
  // Keep fonts as same-origin files: the CSP only permits font-src 'self'.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Libraries in their own files: a deploy that only changes the site keeps them cached.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          motion: ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
  },
});
