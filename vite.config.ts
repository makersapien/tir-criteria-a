import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Update this to match your new repository name
const repoName = 'tir-criteria-a';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  json: {
    namedExports: true,
    stringify: false,
  },
  assetsInclude: ['**/*.svg'],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});