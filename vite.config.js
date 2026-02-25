import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  cacheDir: './.vite',
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
