import { defineConfig } from 'vite';
export default defineConfig({ root: 'apps/desktop/player', base: './', build: { outDir: '../../../.vite/renderer/player_window', emptyOutDir: true } });
