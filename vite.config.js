import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

// base './' keeps asset paths relative so the same build works on
// GitHub Pages (sub-path), Netlify and Vercel without changes.
export default defineConfig({
  plugins: [react()],
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: 'jsdom',
    coverage: { include: ['src/**/*.{js,jsx}'], exclude: ['src/main.jsx'] },
  },
});
