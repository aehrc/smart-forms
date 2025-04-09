import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      // We are trying to access a Questionnaire on a remote forms server and render it, which Vite doesn't allow by default
      // See https://vite.dev/config/server-options.html#server-fs-allow
      strict: false
    }
  }
});
