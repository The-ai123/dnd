import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PlayerBridge, PublicScene } from '@dnd/contracts';
import { mountPublicScene } from '@dnd/map-view';
import '../styles.css';

declare global { interface Window { player: PlayerBridge } }

function Map({ scene, onError }: { scene: PublicScene; onError: (message: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void mountPublicScene(container.current!, scene, tokenId => {
      void window.player.select({ identity: scene.identity, tokenId }).catch((error: unknown) => onError(String(error)));
    }).then(destroy => { if (disposed) destroy(); else cleanup = destroy; }).catch((error: unknown) => onError(String(error)));
    return () => { disposed = true; cleanup?.(); };
  }, [scene, onError]);
  return <div ref={container} className="map" aria-label="Public map" />;
}

function App() {
  const [scene, setScene] = useState<PublicScene>();
  const [error, setError] = useState('');
  useEffect(() => { void window.player.snapshot().then(setScene).catch((reason: unknown) => setError(String(reason))); }, []);
  return <main className="player-workspace"><header><div><small>PLAYER DISPLAY · DEVELOPMENT FIXTURE</small><h1>{scene?.title ?? 'Connecting…'}</h1></div></header>
    {error && <p role="alert">{error}</p>}
    {scene && <><Map scene={scene} onError={setError} /><aside aria-label="Party health">{scene.tokens.filter(token => token.partyHp).map(token => <p key={token.id}>{token.name} <strong>{token.partyHp!.current} / {token.partyHp!.max}</strong></p>)}</aside></>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
