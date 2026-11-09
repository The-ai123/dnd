# Architecture implementation handoff

Updated November 6, 2026. The user authorized implementation in the architecture chat. Planning-only wording in older documents records prior scope; unresolved product decisions remain unresolved.

## A03 — desktop architecture and compatibility

Implemented a strict TypeScript/npm workspace with Electron Forge/Vite, React, role-specific sandboxed preloads, engine and asset utility processes, runtime schemas, serialized engine operations, allowlisted public projections, and a PixiJS WebGL scene fixture. All dependencies are exact-pinned in `package.json` and `package-lock.json`.

The native compatibility probes create a synthetic SQLite database, verify a consistent backup and integrity check, and generate sharp/libvips Deep Zoom tiles. No real world storage schema or gameplay mutation is implemented. Public scene identity includes world instance, scene epoch, revision and context. Hidden entities and enemy numeric HP are omitted from public payloads.

Verification: `npm run check` passes TypeScript and five tests covering public-data omission, stale/foreign/frozen selection rejection, strict payload schemas, queue ordering/failure recovery and dependency boundaries. `npm run package` succeeds. `npm run test:e2e` passes against the Windows x64 executable: two separate renderer processes, SQLite 3.53.4 consistent backup/integrity check, sharp tile generation, WebGL canvas, hidden-data omission, stale-selection rejection, unregistered-sender rejection, and complete player-window close/reopen/render. Expected rejected IPC calls appear in test output. Both window screenshots were visually inspected in the light appearance on this machine.

Packaged compatibility fixes: preserve external native dependencies through Vite's packaging filter, unpack sharp's adjacent libvips DLLs alongside its native binary, and load Pixi's CSP adapter (which replaces eval-based functions). Electron sandbox/context isolation and the script CSP remain enabled. Exact dependency pins and the lockfile capture the tested build. Mixed-monitor/DPI, 4K, fault-injection and clean-machine installer checks remain later release gates; this smoke test does not certify them.

## Scope and next gates

- A01 is now Complete through subsequent user decisions in the product-contract chat: session/reservation, clock/transfer and recovery boundaries are recorded in WORLDS_AND_SESSIONS.md and DATA_AND_RECOVERY.md. They were specified after A03, not implemented by its scaffold.
- A05 is Complete. UI_EDITOR_CONTRACT.md records the approved visual baseline, functional editor requirements and whole-gold valuation rules. The saved mock and portable preview checks are under docs/design. Product editor and persistence work remain implementation tasks.
- B01 is integrated and defines strict domain and IPC envelopes, role and sender validation, world binding and record-version conflicts.
- B02 is integrated. The engine opens the catalog at startup and the shell still displays the development scene. B03 is prerequisite-ready, and B04 owns durable command execution.
- A04 is integrated with continuous geometry feasibility, accuracy certificates and benchmark evidence in `docs/geometry/A04.md`. Production routing, fog persistence and renderer integration remain later tasks.
- A02A is integrated with the working SRD catalog and seeded acceptance cases. A02B retains full-catalog reconciliation and remaining per-entry coverage; see `docs/content/CONTENT_COVERAGE.md`.
- SQLite probe backup is not the C01/C02 product backup/recovery gate. Fixture records are not production world entities or durable history.
- The Home shell is a development screen, not A05-approved application/editor design.
- S01's pinned SRD snapshot and audit are integrated. Application seed normalization and mechanics/editor implementation remain later tasks.

The computer crash interrupted initial runtime verification; source files survived, and the packaged compatibility milestone was subsequently completed. This handoff is included with the architecture foundation commit. See `WORK_BOARD.md` for task ownership and dependencies.

## B01 — domain and IPC contracts

Completed October 27, 2026 in the isolated worktree `C:/Users/adafo/.codex/worktrees/b01-domain-ipc/dnd`, branch `codex/b01-domain-ipc-contracts`. Runtime schemas now define protocol-versioned, role-scoped requests and structured results/errors, world-qualified record identities, safe revisions, explicit expected record versions, approved session states, reservation/placement DTOs and bounded non-executable formula terms. The host checks registered sender/main-frame identity before dispatch, the engine validates current world binding within its serialized queue, and preloads expose only typed capabilities. Unknown operations/fields and wrong world/role/schema input cannot reach handlers. Durable result types are distinct from transient acknowledgements, with response correlation and world/command binding checked.

Verification: `npm run check` passes TypeScript and 12 tests. `npm run package` and `npm run test:e2e` pass against the worktree's packaged Windows application. The expanded smoke test covers current/foreign world queries, unavailable lifecycle handlers, malformed request rejection, valid/stale scene selection, unregistered IPC sender rejection, public privacy, native probes, WebGL and player-window reopening. Electron launch and worktree-local test cache access required running checks outside the sandbox. Dependencies were copied locally for worktree isolation; package manifests and lockfile are unchanged.

Consumer contract and exact scope: [docs/contracts/B01.md](docs/contracts/B01.md). Session create/complete envelopes intentionally return `UNSUPPORTED_OPERATION`; B02 owns repositories/migrations and B04–B06 own transactions, idempotency, lifecycle/reservations/history and enforcement of all approved gameplay policies. Version-conflict helpers are tested contracts for those future handlers, not evidence of durable command execution. B02 becomes prerequisite-ready when this branch is integrated.

## B02 — world and catalog storage

Commit `5257b25` adds the application catalog, one SQLite writer per world, a versioned world identity manifest, transactional migrations and local storage diagnostics in the storyteller window. The repositories validate database identity, schema versions and foreign keys before returning a writer.

`npm run check` passed TypeScript and 16 tests, including two isolated worlds with matching internal record IDs, writer contention and abrupt process exit during migration. `npm run package` and `npm run test:e2e` passed for the Windows x64 package. The smoke test verified catalog startup and storyteller-only diagnostics. [Storage contract](docs/contracts/B02.md)
