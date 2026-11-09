import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
// Resolve this worktree's source even when dependencies are shared with another checkout.
const aliases = Object.fromEntries(['contracts', 'domain', 'engine', 'persistence', 'assets', 'map-view'].map(name => [`@dnd/${name}`, fileURLToPath(new URL(`../../packages/${name}/src/index.ts`, import.meta.url))]));
export default defineConfig({ resolve: { alias: aliases }, test: { include: ['tests/geometry/**/*.test.ts', 'tests/integration/**/*.test.ts'], testTimeout: 120_000 } });
