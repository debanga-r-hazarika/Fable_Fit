import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // Removed input: 'index.html' - Vite handles HTML entry points automatically
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});