import { Application, Graphics, Text } from 'pixi.js';
// Pixi's CSP adapter replaces generated eval functions with ordinary functions.
import 'pixi.js/unsafe-eval';
import type { PublicScene } from '@dnd/contracts';

/** Public DTOs only: this adapter cannot inspect private engine records. */
export async function mountPublicScene(container: HTMLElement, scene: PublicScene, onSelect?: (id: string) => void): Promise<() => void> {
  const app = new Application();
  await app.init({ preference: 'webgl', background: '#172a30', resizeTo: container, antialias: true });
  container.appendChild(app.canvas);
  container.dataset['renderer'] = 'webgl';
  const grid = new Graphics();
  for (let x = 0; x < 1600; x += 50) grid.moveTo(x, 0).lineTo(x, 1200);
  for (let y = 0; y < 1200; y += 50) grid.moveTo(0, y).lineTo(1600, y);
  grid.stroke({ color: '#355059', width: 1 });
  app.stage.addChild(grid);
  for (const token of scene.tokens) {
    const square = new Graphics().roundRect(token.x, token.y, 48, 48, 3)
      .fill(token.partyHp ? '#d7b879' : '#a1bcc0').stroke({ color: '#ffffff', width: 2 });
    square.eventMode = 'static';
    square.cursor = 'pointer';
    square.on('pointertap', () => onSelect?.(token.id));
    const name = new Text({ text: token.name, style: { fontFamily: 'Segoe UI', fontSize: 14, fill: '#eff4f4' } });
    name.position.set(token.x, token.y + 57);
    app.stage.addChild(square, name);
  }
  // Static fixture: redraw only for resize or interaction; no idle animation loop.
  app.render();
  app.stop();
  return () => { app.destroy(true, { children: true }); delete container.dataset['renderer']; };
}
