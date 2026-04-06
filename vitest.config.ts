import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest config separada de vite.config.ts para evitar conflictos
 * con babel-plugin-react-compiler que sólo aplica en dev/build.
 * Los tests usan jsdom como entorno DOM.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
