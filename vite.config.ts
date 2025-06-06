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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['framer-motion']
  },
  resolve: {
    alias: {
      // Fix for framer-motion build issues
      'motion-utils': 'motion-utils/dist/index.js'
    }
  }
});