import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PrivateSnapshot, StorytellerBridge } from '@dnd/contracts';
import '../styles.css';

declare global { interface Window { storyteller: StorytellerBridge } }

function App() {
  const [snapshot, setSnapshot] = useState<PrivateSnapshot>();
  const [error, setError] = useState('');
  useEffect(() => { void window.storyteller.snapshot().then(setSnapshot).catch((reason: unknown) => setError(String(reason))); }, []);
  return <main className="workspace">
    <header><div><small>OFFLINE TABLETOP WORKSPACE</small><h1>Storyteller</h1></div><button onClick={() => void window.storyteller.openPlayer().catch((reason: unknown) => setError(String(reason)))}>Open player display</button></header>
    <nav aria-label="Workspace tabs"><span aria-current="page">Home</span></nav>
    <section className="welcome"><small>DEVELOPMENT FOUNDATION</small><h2>Your workspace starts here.</h2><p>The desktop shell and isolated player display are ready for the next implementation phase.</p><p>No world is open. The player display shows a synthetic compatibility scene.</p></section>
    {error && <p role="alert">{error}</p>}
    {snapshot ? <section aria-label="Architecture diagnostics"><h2>System checks</h2><dl>
      <div><dt>World engine</dt><dd>Ready · separate utility process</dd></div>
      <div><dt>SQLite {snapshot.diagnostics.sqlite}</dt><dd>{snapshot.diagnostics.backupVerified ? 'Backup verified' : 'Pending'}</dd></div>
      <div><dt>Local storage</dt><dd>Catalog schema {snapshot.diagnostics.catalogSchemaVersion} ready</dd></div>
      <div><dt>Image conversion</dt><dd>{snapshot.diagnostics.imageTilesVerified ? 'Tile generation verified' : 'Pending'}</dd></div>
      <div><dt>Player privacy</dt><dd>Separate bridge and public projection</dd></div>
    </dl><p>{snapshot.privateNotes}</p></section> : !error && <p role="status">Connecting to world engine…</p>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
