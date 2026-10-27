import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { MakerZIP } from '@electron-forge/maker-zip';

const config: ForgeConfig = {
  packagerConfig: {
    // sharp's adjacent libvips DLLs must stay beside its unpacked .node binary.
    asar: { unpack: '**/*.dll' },
    executableName: 'storyteller',
    // Vite's default filter drops node_modules, including external native adapters.
    // Packager prunes dev dependencies; keep production modules and their binaries.
    ignore: path => !!path && !/^\/(?:\.vite|node_modules)(?:\/|$)/.test(path) && !['/package.json', '/LICENSE'].includes(path),
  },
  rebuildConfig: {},
  makers: [new MakerZIP({}, ['win32'])],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        { entry: 'apps/desktop/main/index.ts', config: 'vite.main.config.ts', target: 'main' },
        { entry: 'apps/desktop/main/engine-process.ts', config: 'vite.main.config.ts', target: 'main' },
        { entry: 'apps/desktop/main/asset-process.ts', config: 'vite.main.config.ts', target: 'main' },
        { entry: 'apps/desktop/preload/storyteller.ts', config: 'vite.preload.config.ts', target: 'preload' },
        { entry: 'apps/desktop/preload/player.ts', config: 'vite.preload.config.ts', target: 'preload' },
      ],
      renderer: [
        { name: 'storyteller_window', config: 'vite.storyteller.config.ts' },
        { name: 'player_window', config: 'vite.player.config.ts' },
      ],
    }),
  ],
};
export default config;
