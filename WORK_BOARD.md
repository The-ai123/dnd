# Agent work board — task status and scheduling authority

Updated: October 27, 2026. The user authorized implementation, starting with architecture. A03 is complete with packaged Windows compatibility evidence in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md). Remaining tasks and product decisions are tracked below; fixture code does not complete dependent production tasks.

## 1. Status rules

Use exactly **To Do**, **Active**, or **Complete** in Status. Eligibility/blockers are separate from status.

- **To Do:** unclaimed or returned for more work. Includes blocked/unapproved tasks; it does not mean ready.
- **Active:** one named owner has claimed the task, its prerequisites are Complete, required authorization exists, and exact write paths are recorded in the claim log. Work interrupted before completion remains Active only if a live owner is continuing it; otherwise return it to To Do with a handoff.
- **Complete:** acceptance evidence from IMPLEMENTATION_PLAN.md is recorded and reviewed/integrated. Files or partial scaffolds alone do not qualify. A report of completion without evidence does not satisfy downstream dependencies.
- Record actual owner/agent/chat identity; never invent owners for existing files. A03 ownership and completion evidence are recorded below.
- Parent tasks spanning several records/features may be split into child tasks before claiming. Enumerate child IDs/dependencies/paths; mark the parent Complete only when every required child and integration check is Complete. Do not let separate agents claim both parent and children simultaneously.

Planning deliverables marked Complete below mean that the named documents exist and have been checked, not that every product question is settled or the stack is approved/validated.

## 2. Authorization and readiness gates

- **Planning gate:** investigation and specification work may continue. User decisions required by A01/A05 cannot be fabricated or marked Complete by an agent.
- **Build gate:** open following the user's instruction to implement the plan, starting with architecture. Task dependencies and unresolved product decisions still apply; authorization alone does not complete them.
- **Acquisition gate:** S01 can be investigated/planned now, but do not download/vendor a dataset merely because this board was created. Claim and perform source acquisition when that work is authorized; no automatic bulk download in a planning-status update.
- A task is claimable only if every listed dependency is Complete, its gate is open, an owner can finish its acceptance scope, and it does not conflict with another Active claim. Empty dependencies mean no task prerequisite, not bypass of authorization or existing ownership.
- Phase letters are work categories, not phase-wide barriers. Use the actual dependency graph. DAG eligibility and safe concurrent writes are separate checks.

## 3. Current board

P tasks are completed planning deliverables. A–G/S tasks use completion criteria in IMPLEMENTATION_PLAN.md; S details additionally live in CONTENT_DATA_PLAN.md. A task without listed evidence remains To Do even if someone has started related code elsewhere.

| ID | Work item | Status | Owner | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |
| P01 | Architecture baseline and detailed build-plan documents | Complete | Planning chat | — | Planning |
| P02 | Adopt Open5e source and define no-scrape ingestion plan | Complete | Planning chat | P01 | Planning |
| P03 | Dependency/status board and agent handoff organization | Complete | Planning chat | P01, P02 | Planning |
| A01 | Close product-state/ownership gaps and reconcile legacy notes | To Do | — | — | Planning |
| S01 | Pin/audit published Open5e snapshot and 5.2.1 parity | To Do | — | — | Acquisition |
| A02 | Actual SRD inventory, exclusions and automation coverage fixtures | To Do | — | A01, S01 | Planning |
| A03 | Stack review and packaged Windows compatibility proof | Complete | Architecture implementation chat | — | Build |
| A04 | Continuous geometry feasibility and optimality/performance proof | To Do | — | A01, A03 | Build |
| A05 | Approve exact UI/editor schemas and validation behavior | To Do | — | A01 | Planning |
| B01 | Strict domain/IPC contracts and role-scoped envelopes | To Do | — | A01, A03 | Build |
| B02 | World/catalog storage, migrations, writer repositories | To Do | — | B01 | Build |
| B03 | Immutable original-asset ingestion/references | To Do | — | B02 | Build |
| B04 | Atomic commands, idempotency, revisions/projections | To Do | — | B02, B03 | Build |
| B05 | Canonical identities, sessions, clocks, reservations | To Do | — | B04 | Build |
| B06 | Session action groups, conflict-aware undo/redo, completion | To Do | — | B05 | Build |
| B07 | Durable editor/draft versions and checkpoints | To Do | — | B04, A05 | Build |
| B08 | In-flight job/action and filesystem-intent recovery | To Do | — | B06, B07 | Build |
| S02 | Open5e adapter, corrections and normalized content schemas | To Do | — | S01, A02, A05, B01, B07 | Build |
| S03 | Reproducible offline bundle, attribution and data regression | To Do | — | S02 | Build |
| C01 | Consistent snapshot/asset-manifest backups | To Do | — | B03, B04, B08 | Build |
| C02 | Backup-gated New Session/Restore | To Do | — | C01, B05 | Build |
| C03 | World archives/import/historical restore into separate worlds | To Do | — | C01, B07, C02 | Build |
| C04 | World Trash/restore/confirmed empty/cross-volume recovery | To Do | — | C03 | Build |
| C05 | Chooser/Home/world-campaign switch/tab shell | To Do | — | B05, B07, A05 | Build |
| C06 | World Manager/session controls/Settings/Data views | To Do | — | C02, C04, C05 | Build |
| C07 | Global library/campaign-copy/update workflows | To Do | — | B03, B07, C05 | Build |
| D01 | Content/entity/preset/variant editors and bundled data integration | To Do | — | C07, S03, A05 | Build |
| D02 | Saved location/area templates and instances | To Do | — | B05, B07, C07, A05 | Build |
| D03 | Isolated autosaved setup draft/player-camera preview | To Do | — | D02, B07 | Build |
| D04 | Atomic Start/cancel/conflict/capacity/reservation checks | To Do | — | D03, B06, C05 | Build |
| D05 | Notes/quests/lore with rich text and record links | To Do | — | D01, C06 | Build |
| D06 | Tiered loot/shop generation drafts/finalized stock | To Do | — | D01, B07 | Build |
| E01 | Private/public scene projections and epochs | To Do | — | B04, B05 | Build |
| E02 | Tile-image jobs, GPU cache and viewport renderer | To Do | — | A03, B03 | Build |
| E03 | Geometry editor/grid/scale/cameras | To Do | — | A04, E02, D02 | Build |
| E04 | Square tokens/stacks/health/conditions/selection/targets | To Do | — | E01, E03, A05 | Build |
| E05 | Hover/retained/pinned inspectors and party HP panel | To Do | — | E04, D01 | Build |
| E06 | Around routing/measurement and Over/Through | To Do | — | A04, E03, B06 | Build |
| E07 | Wall/door/radius visibility/exploration memory | To Do | — | E01, E03 | Build |
| E08 | Frozen/staging/live/replay player-window lifecycle | To Do | — | E01, E07, D04 | Build |
| F01 | Initiative/rounds/actions/resources/movement budgets | To Do | — | B05, B06, B01 | Build |
| F02 | Effects/modifiers/triggers/timers/defenses/concentration | To Do | — | A01, F01 | Build |
| F03 | Persisted resolution stack and reaction/ruling prompts | To Do | — | B08, F02 | Build |
| F04 | Guided leveling/multiclass choice ledger | To Do | — | A02, D01, F02 | Build |
| F05 | All enabled bundled feature/spell mechanics and coverage | To Do | — | F03, F04, E07 | Build |
| F06 | Path interruption and whole-action correction integration | To Do | — | F03, F05, E06 | Build |
| G01 | Session replay/seek/historical private-public views | To Do | — | B07, E08, F06 | Build |
| G02 | Full offline world/game rehearsal and fault injection | To Do | — | C04, C06, C07, D05, D06, E05, E08, F06, G01 | Build |
| G03 | UI/accessibility/mixed-DPI performance validation | To Do | — | G02, A05 | Build |
| G04 | Windows release/attribution/migrations/recovery instructions | To Do | — | G02, G03 | Build |

### To Do / Active / Complete snapshot

- **To Do:** all A–G and S tasks except A03. Production IPC, storage/history, recovery, gameplay, content and release work remain unfinished.
- **Active:** none in this board at handoff.
- **Complete:** P01, P02, P03 (planning artifacts), A03 (tested architecture foundation).
- **Next:** A01 product-contract resolution and S01 source pin/audit have no task prerequisites. S01 still requires a recorded acquisition claim and provenance/license audit. A01 unlocks A04, A05 and B01; A02 additionally needs S01. No dependent production task is currently eligible solely because A03 is complete.

## 4. Sequential spine and parallel lanes

The required shared-foundation spine is:

`A01 + A03 → B01 → B02 → B03 → B04 → B05 → B06`

Separately `A01 → A05`, `S01 + A01 → A02`, and `A01 + A03 → A04`. These converge into content/UI/geometry work as listed in the board. B07 joins B08 after B06. Do not serialize everything by waiting for an entire lettered phase.

| Opportunity | Can progress together once each task is eligible | Coordination requirement |
| --- | --- | --- |
| Early preparation | A01 product decisions; S01 source audit; A03 packaging proof after build authorization | Only A01 product owner resolves requirements; separate paths and acquisition/build gates |
| Approved behavior | A02 content coverage, A04 geometry proof, A05 UI schema review | Shared data/field contracts reviewed before code depends on them |
| Durable foundation | B05 memberships versus B07 editor revisions; E02 tile rendering once B03 exists | Only if exact files/migrations are disjoint; shared persistence integration has one owner |
| Post-foundation | Recovery lane C01→C02→C03→C04; UI C05→C07; E01 projection work; S02→S03; F01→F02 | Each branch still meets board dependencies; no shared barrel/schema editing without owner coordination |
| Preparation | D01 content editors; D02→D03→D04 area staging; continuing recovery/manager work | D02 does not wait for unrelated spell/item editors; records/contracts remain stable |
| Play features | E04 token states, E06 path UI, E07 visibility after E03; rules/progression lane and management D05/D06 when eligible | Map layer/input ownership coordinated; do not assign one canvas/input controller to multiple writers |
| Rules catalog | Distinct F05 child feature/spell families | Create child rows with prerequisite mechanics; shared primitives owned by one integration task; per-entry evidence required |
| Integration/release | G01 replay then G02 rehearsal then G03/G04 release path | Integration gates are sequential, not independently declared done by feature agents |

These are **conditional parallel opportunities**, not a promise all listed tasks are ready at once or share no files. If file claims overlap, serialize or agree an explicit integration boundary before editing.

## 5. File ownership and interface freeze

| Lane | Expected write scope | Shared boundary requiring coordination |
| --- | --- | --- |
| Product/planning coordinator | Root planning documents and board | User decisions, IDs/dependencies/status; other agents send findings rather than simultaneously rewriting plans |
| Source/data | `data/upstream`, `data/corrections`, `docs/content`, `packages/content` | Internal schemas from contracts; rules handler availability is a separate responsibility |
| Desktop/bootstrap | `apps/desktop/main`, `apps/desktop/preload`, root build/package configuration | One integrator for dependency manifests/lockfiles, native ABIs and role bridges |
| Authority/storage | `packages/domain`, `packages/engine`, `packages/persistence` | One owner for shared schema/migration numbering/command registry; subdivide by files before concurrent tasks |
| Recovery/assets | `packages/recovery`, `packages/assets`, asset/archive job entry points | Asset/reference and transaction contracts frozen by B03/B04; shared code owners review changes |
| Geometry/map | `packages/geometry`, `packages/map-view` | One geometry API, one map input/layer integrator; feature contributors get disjoint modules |
| Management UI | Individual `apps/desktop/storyteller/features/<tool>` modules | Shared `packages/ui`, tab/router/store contracts owned by UI integrator |
| Public UI | `apps/desktop/player` | Public schemas/projection filtering owned by E01; do not import private record objects |
| Rules/progression | Disjoint `packages/rules` modules and coverage fixtures | Trusted handler registry/primitive semantics owned by one rules integrator |

Paths are intended boundaries, not evidence those modules exist. Exact claimed paths must be recorded before work. Never edit another task's active files, overwrite untracked work, regenerate a lockfile concurrently, or change an interface without notifying consumers and updating its dependent tasks.

## 6. Claim, handoff, integration and completion

1. Read PLANNING_INDEX.md and the task's specification/acceptance rows. Inspect live filesystem, relevant local instructions and Active claims. Locate owner of conflicting existing work before editing it.
2. Check gate/dependencies. If waiting on a decision or artifact, keep To Do and record blocker; work on a different eligible task. Do not fake dependencies Complete to unblock yourself.
3. Coordinator serializes claims: update Status→Active and Owner, then append the claim below with exact paths, prerequisites, intended evidence and date. Simultaneous agents cannot safely claim by racing Markdown writes; use a single coordinator to assign/edit the board.
4. Implement only the claimed scope. Use explicit contracts/fixtures for unfinished neighbors; fixtures do not satisfy final integration. Report cross-boundary changes to their owner before editing shared interfaces.
5. Validate completion evidence, integrate changes, and record commit or exact files, tests/manual checks, known limits and follow-up IDs. Then coordinator marks Complete, clears stale blockers and computes newly eligible tasks.
6. If abandoned/interrupted, write partial-work handoff and return To Do (or transfer owner explicitly). Preserve uncommitted files. Reopen a Complete task to To Do if a later change invalidates its evidence; audit descendants before proceeding.

### Active claim / blocker log

**A03 — completed by Architecture implementation chat, October 27, 2026.** User explicitly instructed implementation in this chat. Paths: `apps/desktop/**`, `packages/{contracts,domain,engine,persistence,assets,map-view}/**`, `tests/**`, root npm/TypeScript/Vite/Forge/Playwright/Vitest configuration, `README.md`, `IMPLEMENTATION_STATUS.md`, and this A03 status/evidence entry. Existing scaffold belongs to this chat. No A01-dependent gameplay behavior was implemented. Typecheck, five architecture tests, Windows package and packaged two-window/native/WebGL/privacy/reopen smoke test pass. Details and limitations are recorded in `IMPLEMENTATION_STATUS.md`. Other task statuses remain unchanged.

Append additional entries using:

```text
Task:
Owner / coordinating chat:
Claimed date:
Exact write paths:
Completed dependencies / authorization:
Interface inputs and consumers:
Blocker / question (if any):
Partial-work handoff (if any):
```

### Completion evidence log

- **A03 | Architecture implementation chat | October 27, 2026:** exact files and evidence in `IMPLEMENTATION_STATUS.md`; pinned Electron 45/Forge 8/Vite 8/React 19/Pixi 8/native SQLite and sharp workspace; `npm run check`, `npm run package`, `npm run test:e2e` pass. Packaged native backups/tiles, WebGL and isolated windows verified. No product-state/geometry/editor approval inferred. A04 and B01 still require A01 before they are eligible; no dependent task claimed.

- **P01:** ARCHITECTURE.md and IMPLEMENTATION_PLAN.md written as recommended technical baseline and acceptance-based build sequence; no package compatibility proof claimed.
- **P02:** CONTENT_DATA_PLAN.md records selected Open5e files, pinning/provenance/5.2.1 audit, no-scrape/offline pipeline and separate mechanics gate. Raw dataset acquisition remains S01 To Do.
- **P03:** WORK_BOARD.md added; all implementation tasks assigned explicit dependencies, gate and initial status; no Active implementation claim or fabricated validation. Dependency consistency/cycle checks recorded by this planning update.

Future completion entry: `Task | Owner | Date | Commit/files | Behavioral/test evidence | Remaining limitations/new task IDs`.
