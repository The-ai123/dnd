import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sources(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

it('keeps domain/engine pure and renderers away from authority and native adapters', () => {
  for (const folder of ['packages/domain/src', 'packages/engine/src', 'apps/desktop/storyteller', 'apps/desktop/player', 'packages/map-view/src']) {
    for (const file of sources(folder)) {
      const imports = [...readFileSync(file, 'utf8').matchAll(/(?:from\s+|import\s*\()['"]([^'"]+)/g)].map(match => match[1]!);
      for (const dependency of imports) {
        expect(dependency, `${relative('.', file)} imports privileged dependency`).not.toMatch(/^(?:electron|node:|better-sqlite3|sharp|@dnd\/(?:persistence|assets|recovery))/);
        if (folder.startsWith('apps/') || folder.includes('map-view')) expect(dependency).not.toMatch(/^@dnd\/(?:engine|domain|rules)/);
        if (folder.includes('domain') || folder.includes('engine')) expect(dependency).not.toMatch(/^(?:react|pixi\.js)/);
      }
    }
  }
});
