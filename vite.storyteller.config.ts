import { defineConfig } from 'vite';
export default defineConfig({ root: 'apps/desktop/storyteller', base: './', build: { outDir: '../../../.vite/renderer/storyteller_window', emptyOutDir: true } });
