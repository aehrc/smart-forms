import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// @ts-ignore
import packageJson from './package.json';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // resolve preserveSymlink to boolean(Explicitly parse the string to a boolean)
  // When VITE_PRESERVE_SYM_LINKS is not "false", it should always default to true
  const preserveSymlinks = process.env.VITE_PRESERVE_SYM_LINKS === 'false' ? false : true;

  return defineConfig({
    plugins: [react(), svgr()],
    define: {
      RENDERER_VERSION: JSON.stringify(packageJson.dependencies['@aehrc/smart-forms-renderer'])
    },
    optimizeDeps: {
      include: ['@aehrc/sdc-assemble', '@aehrc/sdc-populate', '@emotion/react', '@emotion/styled']
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/, '@aehrc/sdc-assemble', '@aehrc/sdc-populate']
      }
    },
    // preserveSymlinks should default to true
    // This ensures vite build plays nice with CJS modules (@aehrc/sdc-assemble and @aehrc/sdc-populate) when building for production
    // IMPORTANT: When running locally and making changes to the smart-forms-renderer package, create a .env.local file with VITE_PRESERVE_SYM_LINKS=false
    // This will ensure that packages are not symlinked to allow changes to be reflected during local dev
    resolve: { preserveSymlinks: preserveSymlinks }
  });
};
