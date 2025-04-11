import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// @ts-ignore
import packageJson from './package.json';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react(), svgr()],
    define: {
      RENDERER_VERSION: JSON.stringify(packageJson.dependencies['@aehrc/smart-forms-renderer'])
    }
  });
};
