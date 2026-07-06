import { defineConfig } from 'vite';
import { resolve } from 'path';

// baeyc0510.github.io 는 유저 루트 Pages 이므로 base 는 '/'
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
      },
    },
  },
});
