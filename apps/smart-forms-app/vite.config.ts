import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  optimizeDeps: {
    include: ['@aehrc/sdc-assemble', '@aehrc/sdc-populate']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, '@aehrc/sdc-assemble', '@aehrc/sdc-populate']
    }
  }
  // resolve: { preserveSymlinks: true }
});
