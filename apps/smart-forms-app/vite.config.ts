import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    'process.argv': process.argv, // temporary solution for json-diff & vite combination (see: https://github.com/andreyvit/json-diff/issues/123)
    'process.env': {} // temporary solution for json-diff & vite combination (see: https://github.com/andreyvit/json-diff/issues/123)
  }
});
