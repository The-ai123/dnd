# Architecture implementation handoff

Updated October 27, 2026. The user authorized implementation in the architecture chat. Planning-only wording in older documents records prior scope; unresolved product decisions remain unresolved.

## A03 — desktop architecture and compatibility

Implemented a strict TypeScript/npm workspace with Electron Forge/Vite, React, role-specific sandboxed preloads, engine and asset utility processes, runtime schemas, serialized engine operations, allowlisted public projections, and a PixiJS WebGL scene fixture. All dependencies are exact-pinned in `package.json` and `package-lock.json`.

The native compatibility probes create a synthetic SQLite database, verify a consistent backup and integrity check, and generate sharp/libvips Deep Zoom tiles. No real world storage schema or gameplay mutation is implemented. Public scene identity includes world instance, scene epoch, revision and context. Hidden entities and enemy numeric HP are omitted from public payloads.

Verification: `npm run check` passes TypeScript and five tests covering public-data omission, stale/foreign/frozen selection rejection, strict payload schemas, queue ordering/failure recovery and dependency boundaries. `npm run package` succeeds. `npm run test:e2e` passes against the Windows x64 executable: two separate renderer processes, SQLite 3.53.4 consistent backup/integrity check, sharp tile generation, WebGL canvas, hidden-data omission, stale-selection rejection, unregistered-sender rejection, and complete player-window close/reopen/render. Expected rejected IPC calls appear in test output. Both window screenshots were visually inspected in the light appearance on this machine.

Packaged compatibility fixes: preserve external native dependencies through Vite's packaging filter, unpack sharp's adjacent libvips DLLs alongside its native binary, and load Pixi's CSP adapter (which replaces eval-based functions). Electron sandbox/context isolation and the script CSP remain enabled. Exact dependency pins and the lockfile capture the tested build. Mixed-monitor/DPI, 4K, fault-injection and clean-machine installer checks remain later release gates; this smoke test does not certify them.

## Scope and next gates

- A01 remains open: session/reservation semantics, effect clock ownership and other product gaps are not decided by the scaffold.
- B01 remains open: production command/query envelopes, expected-record-version conflicts and world binding require A01 and A03. Current schemas are a narrow A03 fixture contract.
- A04 remains open: no continuous pathfinding, fog, optimality claim or performance benchmark is implemented.
- SQLite probe backup is not the C01/C02 product backup/recovery gate. Fixture records are not production world entities or durable history.
- The Home shell is a development screen, not A05-approved application/editor design.
- No SRD dataset was downloaded or mechanics/editor implementation claimed.

The computer crash interrupted initial runtime verification; source files survived, and the packaged compatibility milestone was subsequently completed. This handoff is included with the architecture foundation commit. See `WORK_BOARD.md` for task ownership and dependencies.
