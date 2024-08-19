import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@aehrc/sdc-populate']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, '@aehrc/sdc-populate']
    }
  },
  resolve: { preserveSymlinks: true }
});
