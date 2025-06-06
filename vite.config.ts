import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'tir-criteria-a';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});