import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'magnetism-crit-c';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  json: {
    namedExports: true,
    stringify: false,
  },
  assetsInclude: ['**/*.svg'],
});
