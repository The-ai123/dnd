# Sequential implementation plan

Status: implementation authorized by the user, starting with architecture. A03 is complete with packaged Windows compatibility evidence in IMPLEMENTATION_STATUS.md. Other tasks retain their dependencies and completion criteria; fixture code does not satisfy production milestones. Read PLANNING_INDEX.md, ARCHITECTURE.md and current product specifications first.

**Execution authority:** [WORK_BOARD.md](WORK_BOARD.md) is the single source of task status, dependencies and owner claims. This document supplies deliverable/completion criteria; it must not maintain a second competing status list. [CONTENT_DATA_PLAN.md](CONTENT_DATA_PLAN.md) defines Open5e source acquisition/normalization. Phase letters are categories, not full-phase barriers: a task can start when its explicit dependencies and authorization gate are satisfied.

Each task below is a separate reviewable unit. Do not skip an unfinished dependency. Record changed files, design decisions, test evidence and unresolved issues in the handoff after each task. Do not call a partial rules subset the completed MVP.

## Phase A — specification and technical risk reduction

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| A01 | Resolve ARCHITECTURE.md section 14 product gaps; reconcile contradictory legacy review notes | None | One explicit state/ownership/behavior contract, with unresolved items clearly excluded from dependent work |
| A02 | Complete the SRD coverage plan through A02A and A02B | A02A, A02B | Both child deliverables integrated and their acceptance evidence recorded |
| A02A | Pin the working catalog and seed coverage/acceptance fixtures | A01, S01 | Reproducible 6,743-row inventory, 814-entry matrix, proposed availability/dependency policy, printed-heading reconciliation and 202 concrete cases linked to 209 entries; sufficient inputs for normalization and progression foundations |
| A02B | Finish SRD reconciliation and all entry-specific automation/progression acceptance | A02A, A05 | Resolve every category/variant and mixed-effect scope question, document missing definitions/correction requirements, and give every enabled feature/spell and selectable branch independent expected outcomes, handler requirements, progression/dependency and lifecycle/undo cases |
| A03 | Review stack and prove packaged Windows compatibility | User instruction to implement; architecture review | Minimal Electron/React app with two windows, packaged SQLite backup call, packaged sharp tile generation, Pixi WebGL initialization; versions/native ABI/build scripts pinned |
| A04 | Prove geometry feasibility against agreed cases/optimality tolerance | A01, A03 | Continuous-coordinate paths, weighted versus geometric optimization, footprint clearance, fog geometry, 0.1-ft precision and max-extent sparse memory evidence |
| A05 | Approve exact UI/editor schemas and validation/status behavior | A01, existing graphical decisions | Reviewed Home/manager/Play/inspector/editor layouts and a field contract; raw incomplete input separated from valid gameplay state |

A02 was split at the user's request on November 9, 2026. A02A supplies a verified working catalog and representative acceptance cases. S02 and F04 consume A02A while retaining their other prerequisites. A02B carries the remaining full-catalog review and exhaustive expected outcomes, and is a prerequisite for F05. S03 retains its S02 dependency and full baseline validation requirements. Availability interpretations remain subject to A02B review.

A03/A04 are implementation-time spikes. A03 is complete; A04 still depends on A01. If a spike fails, revise its architecture decision before building dependent systems; do not silently swap libraries or weaken product guarantees.

## Dataset acquisition and normalization lane

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| S01 | Pin Open5e published 2024 JSON snapshot; audit license/provenance, category inventory and SRD 5.2.1 parity | None | Immutable source SHA/hash manifest; no scraping; actual counts/references; explicit patch-version corrections/gaps |
| S02 | Versioned Open5e adapter and validated internal content mapping | S01, A02A, A05, B01, B07 | Reproducible ID/provenance mapping, resolved dependencies, diagnostics, correction layer; mechanics not falsely marked complete |
| S03 | Deterministic offline bundle, attribution and regression fixtures | S02 | Offline seed bundle, hashes/inventory checks, all-category samples, no runtime API use; source update diff workflow |

S01 can be prepared alongside product/visual planning; acquisition is a separately claimed task, not work performed merely by adopting the source. Dataset adapter work can proceed alongside map/recovery/UI work once its schemas and dependencies are complete. F05 remains the separate executable-mechanics release gate.

## Phase B — authority and durable foundation

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| B01 | Define strict domain/IPC schemas and role-scoped command/query envelopes | A01, A03 | No renderer filesystem/SQL access; invalid sender/schema/world binding rejected |
| B02 | World/catalog folder contracts, schema migrations, single-writer repositories | B01 | Two sample worlds isolated; crash-safe schema upgrade; foreign keys/version checks and local-storage diagnostics |
| B03 | Immutable asset ingestion and reference tracking | B02 | Original hash storage, publish-before-reference invariant, historical references safe, derived files disposable |
| B04 | Atomic command execution, idempotency, record revisions and query projections | B02, B03 | Crash/duplicate-command tests prove current state and history agree, exactly one acknowledged outcome |
| B05 | World/campaign/entity/location/session identities, independent clocks, membership/reservations | B04 | Canonical shared records, one-party campaign, read-only reserved manager access and present-state continuation |
| B06 | Session action grouping, bounded conflict-aware undo/redo and completion seals | B05 | Multi-record action reversals, external-change conflict, redo invalidation and completed-history integrity |
| B07 | Durable editor/document/draft revisions and checkpoints | B04, A05 | Noncombat edits/assets/setup drafts reconstructable; incomplete form drafts do not corrupt valid values |
| B08 | Recovery of in-flight jobs/actions and per-world operation intents | B06, B07 | Restart cases distinguish committed phase, pending choice, unfinished import and orphan temporary files |

Keep gameplay modules minimal until this foundation passes. UI-local stores are not durable truth. Native SQLite rollback/WAL is not product history.

## Phase C — data safety and outer application

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| C01 | Consistent world backup and manifest verification | B03, B04, B08 | Snapshot revision/assets agree; missing disk/permissions fail without marking backup complete |
| C02 | Backup-gated New Session and Restore orchestration | C01, B05 | Failure blocks, Retry/Choose Folder works, retry creates no duplicate sessions/restores |
| C03 | Full-world export/import and historical restore into separate worlds | C01, B07, C02 | Original unchanged, internal links/assets/history preserved, target revision reconstructs all approved durable state |
| C04 | World Trash, restore, confirmed emptying, cross-volume recovery | C03 | No expiry/automatic pruning; only owned Trash targets deleted; backups travel with world; interruption recovery |
| C05 | Chooser, world/campaign creation/switching, Home, workspace tabs | B05, B07, A05 | Last tabs/focus restored; missing-path fallback; one tab per record and one Play; no game-time changes from navigation |
| C06 | World Manager, session controls/history lists, Settings/Data views | C02, C04, C05 | Approved seven manager sections and six settings sections; reserved-record Open Session; durable save/error UI |
| C07 | Global library and explicit versioned campaign-copy/update workflow | B03, B07, C05 | Update preview/dependencies, no retroactive generated-entity/encounter changes, offline archive independence |

## Phase D — content and encounter preparation

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| D01 | Images/items/entities/presets/variant/spell/option editors with seeded content | C07, S03, A05 | Autosave/version recovery, runtime validation, exact approved transforms; thumbnail/table/grid views and built-in dataset integration |
| D02 | Saved location/area templates and instance lifecycle | B05, B07, C07, A05 | Canonical location effects versus encounter/template data follow approved ownership; no hidden HP copies; not dependent on every unrelated editor being finished |
| D03 | Autosaved isolated map staging and player-camera preview | D02, B07 | Staged HP/enemies/terrain independent of live state across restart |
| D04 | Atomic Start/cancel, stale-base/capacity/reservation validation | D03, B06, C05 | Start commits together; failure holds old scene; Keep Draft/discard and previous-map resume work |
| D05 | Rich-text session notes, lightweight quests and world/location lore | D01, C06 | Tags, record links/images, editable quest statuses, historical reconstruction, no document code execution |
| D06 | Tiered loot tables, shop generation drafts/finalized stock | D01, B07 | Exact approved formula/shuffle/caps/stops, no auto-reroll, manual over-budget warning, persistent stock |

## Phase E — map and player presentation

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| E01 | Separate private/public projection builders and scene epochs | B04, B05 | Player payload/IPC snapshots contain no hidden entities/private stats; stale cross-world input rejected; initial fixtures precede final staging/lifecycle integration |
| E02 | Background image pyramid jobs, GPU cache, viewport rendering | A03, B03 | Large original remains off GPU; tiles visible at mixed DPI; bounded memory; cancellation/resource errors recover |
| E03 | Drawing/mechanical geometry editor, grid/scale, cameras | A04, E02, D02 | 5-foot scale/fractional positions, uniform grid density hiding, Alt detail, independent camera preview |
| E04 | Square tokens, stack cycling, health/status/selection/target markers | E01, E03, A05 | Approved thresholds/zero/dead behavior and simultaneous markers; no numeric overlays in low-detail mode |
| E05 | Hover/click/pinned inspectors and player HP panel | E04, D01 | Space/Q/Alt+Q/Shift+Q behavior, stable numbers, guards, one-way selection/hover, remembered safe bounds |
| E06 | Around routing/measurement/terrain, then Over/Through adapters | A04, E03, B06 | W waypoints/R modes, footprint clearance, route cost/distance distinction, speed warning only, collision overrides recorded |
| E07 | Wall/door/radius visibility and explored memory | E01, E03 | Shared party vision, dim exploration, unseen enemies absent, historical visibility revisions and safe public assets; can develop beside token styling |
| E08 | Frozen/staging/live/replay player-window lifecycle | E01, E07, D04 | Reopen safely, hold old map with label, cross-world pan/zoom-only snapshot, Start camera, Cancel and Close Play behavior |

Public filtering is designed in E01, not left until a final UI pass. Build only development fixtures before visibility filtering is usable; do not deliver a supposedly private two-monitor release with filtering deferred.

## Phase F — turn/rules engine and progression

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| F01 | Initiative/rounds/actions/resources/movement budgets | B05, B06, B01 | Manual rolls/order, ties, zero-HP membership control, warning-only action/resource use, explicit clocks; use movement contracts/fixtures until F06 integrates paths |
| F02 | Effects, modifiers, triggers, timers, defenses, concentration | A01, F01 | Approved origin-clock policy, trigger ordering, recurring saves/damage, undo and expiry cases |
| F03 | Persisted resolution stack and reaction/ruling prompts | B08, F02 | Restart while choosing, nested reaction choices, phase grouping and no reroll/duplicate spending |
| F04 | Guided creation/leveling and multiclass choice ledger | A02A, D01, F02 | Levels 1–20, supported score/HP methods, derived sheets, override preservation, deferred-feature acknowledgment |
| F05 | Complete enabled SRD feature/spell implementations in coverage slices | A02B, F03, F04, E07 | Per-entry fixtures, terrain/templates/targets, resources, saves/damage/conditions/progression; all enabled entries complete before MVP |
| F06 | Movement interruption integration and whole-action correction | F03, F05, E06 | Stop mid-path, keep traveled segment, resource/effect interactions; whole-group undo with conflict protection |

Progress through rules by dependency (damage/conditions before spells depending on them). Track exact matrix status; no unchecked “generic automation complete” milestone.

## Phase G — history, release and final handoff

| ID | Task | Depends on | Completion evidence |
| --- | --- | --- | --- |
| G01 | Session replay checkpoints/seeking and historical public views | B07, E08, F06 | Step/speed/seek; recorded outcomes and old content/assets; no live mutation |
| G02 | Full offline campaign/world rehearsal and fault injection | C04, C06, C07, D05, D06, E05, E08, F06, G01 | Long encounter, 100 entities, multiple campaigns/shared reservations, setup cancellation, export/restore/Trash, crashes and backup failures; explicit terminal dependencies replace vague all-functional wording |
| G03 | UI/accessibility/performance pass on agreed hardware | G02, A05 | Comfortable/Dense and light/dark; 1080p–4K/mixed DPI; no overlapping state markers; measured CPU/memory/latencies |
| G04 | Windows release package, attribution, migration and user recovery instructions | G02, G03 | Clean offline install/start; native modules/assets/content bundled; backup/restore documented; no cloud dependency |

## Completion reporting

October 27, 2026 — **A03 completed** following the user's instruction to implement, starting with architecture. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for changed paths, pinned build choices, passing checks, packaged compatibility evidence and remaining limits. **A01 is now Complete:** approved contract and evidence in WORLDS_AND_SESSIONS.md, DATA_AND_RECOVERY.md and WORK_BOARD.md. At that point, A05 had an accepted visual baseline and was awaiting final functional approval. A04 and B01 are prerequisite-ready but unclaimed; S01 is still MVP acquisition work. Production implementation is not completed by these specifications. WORK_BOARD.md remains the status/ownership authority.

For each task append a concise implementation note when actually performed: status, commit/files, dependencies satisfied, behavioral evidence, tests/fixtures, known limits and next task. The final MVP is complete only when the product coverage checklist, full enabled SRD matrix, recovery cases and two-window workflows all pass. Build times/cost estimates are intentionally not invented before technical spikes and content enumeration.

November 6, 2026: **A05 is Complete.** See [UI_EDITOR_CONTRACT.md](UI_EDITOR_CONTRACT.md) for the approved editor, validation and workflow contract and [WORK_BOARD.md](WORK_BOARD.md) for the completion evidence and remaining prerequisites.
