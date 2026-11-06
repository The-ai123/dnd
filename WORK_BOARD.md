# Agent work board — task status and scheduling authority

Updated: October 27, 2026. A01's user-approved state/ownership/behavior contract and downstream exclusions are complete; evidence below. The user authorized implementation, starting with architecture. A03 is complete with packaged Windows compatibility evidence in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md). Remaining tasks and task-specific decisions are tracked below; fixture code does not complete dependent production tasks.

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
| A01 | Close product-state/ownership gaps and reconcile legacy notes | Complete | Codex — A01 product-contract chat (this chat) | — | Planning |
| S01 | Pin/audit published Open5e snapshot and 5.2.1 parity | Complete | Codex — S01 implementation chat | — | Acquisition |
| A02 | Actual SRD inventory, exclusions and automation coverage fixtures | To Do | — | A01, S01 | Planning |
| A03 | Stack review and packaged Windows compatibility proof | Complete | Architecture implementation chat | — | Build |
| A04 | Continuous geometry feasibility and optimality/performance proof | To Do | — | A01, A03 | Build |
| A05 | Approve exact UI/editor schemas and validation behavior | Active | Codex — A01/A05 product-contract chat (this chat) | A01 | Planning |
| B01 | Strict domain/IPC contracts and role-scoped envelopes | Complete | Codex — B01 implementation chat | A01, A03 | Build |
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

- **To Do:** all A–G and S tasks except completed A01/A03/B01/S01 and Active A05.
- **Active:** A05 — Codex — A01/A05 product-contract chat (this chat).
- **Complete:** P01, P02, P03 (planning artifacts), A01 (approved product contract), A03 (tested architecture foundation), B01 (validated domain/IPC boundary), S01 (pinned and audited source).
- **Next:** Start A02 and B02 in parallel while A05 review and A04 geometry proof continue.

### Ready parallel work — November 6 handoff

The following lanes have completed task prerequisites. They are opportunities, not new claims. The assigned owner must record exact paths before writing and satisfy the task's own evidence/gate. A05 remains owned by this chat; no unapproved functional details are frozen merely to enable another task.

| Lane | Ready work / scope boundary | Coordination and next unlock |
| --- | --- | --- |
| A02 | Catalog the pinned SRD, document exclusions, and define automation/progression fixtures | A01 and S01 are complete. Use `docs/content/CONTENT_INVENTORY.md` and the parity audit. Coordinate editor requirements with A05 |
| B02 | Implement world/catalog storage, migrations, and writer repositories | B01 is integrated. Use `docs/contracts/B01.md`. Unblocks B03 |
| A04 | Continue the geometry proof on `codex/a04-geometry-feasibility` | The spike has measured evidence. Weighted-route certification and performance validation remain open |
| A05 | Finish final library/progression and broader functional-contract review, including remaining shop lifecycle decisions | This chat owns root planning documents and `docs/design/**`. New lanes send evidence/contract proposals to the coordinator instead of editing the board/root plans concurrently. B07 and downstream UI/content gates remain blocked until A05 Complete |

A02, B02, A04 and A05 can progress concurrently within those boundaries. S02 still requires A02, A05 and B07. Keep package manifests and lockfiles under one integrator.

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

**B01 — completed by Codex — B01 implementation chat, October 27, 2026.**

- Branch: `codex/b01-domain-ipc-contracts`. Prerequisites A01/A03 Complete; user explicitly requested B01 on its own branch.
- Isolated managed worktree: `C:/Users/adafo/.codex/worktrees/b01-domain-ipc/dnd`. Moved verified task files out of the shared checkout after another chat switched its branch; preserved unrelated acquisition/geometry work.
- Exact write paths: `packages/contracts/src/**`, `packages/domain/src/**`, `apps/desktop/main/{index,ipc-boundary,engine-process}.ts`, `apps/desktop/preload/{storyteller,player}.ts`, `tests/integration/{contracts,ipc-boundary}.test.ts`, `tests/e2e/desktop.spec.ts`, `docs/contracts/B01.md`, `WORK_BOARD.md`, `IMPLEMENTATION_STATUS.md`.
- Evidence: strict domain and role-scoped request/result schemas; registered top-frame sender checks; authoritative world binding; structured version conflicts; negative boundary tests and packaged two-window smoke test.
- Boundary: B02–B06 own storage, durable execution/idempotency, reservations and lifecycle handlers. A05 editor/content details remain pending; no competing editor or planning paths are claimed beyond this task's board/status evidence.

**A05 — claimed by Codex — A01/A05 product-contract chat (this chat), October 27, 2026.**

- Exact repository write paths: `WORK_BOARD.md`, `UI_EDITOR_CONTRACT.md` (new review contract), `GRAPHICAL_DESIGN.md`, `APP_NAVIGATION.md`, `PLANNING_INDEX.md`, `PROJECT_PLAN.md`, `IMPLEMENTATION_PLAN.md`. Review previews: thread-owned visualization directory `C:/Users/adafo/.codex/visualizations/2026/10/27/01a17dbf-3873-7e01-82a5-774ea25be09e/`.
- Prerequisites / authorization: A01 Complete; planning gate open; user requested A05. No competing Active claim recorded. Preserve existing uncommitted A01 document edits.
- Inputs / consumers: A01 contract, approved navigation and graphical decisions; B07/C05–C07/D01–D06/E04–E05 and content schemas consume reviewed field/interaction contracts.
- Intended evidence: reviewable Home/manager/Play/inspector/editor layouts; exact field/validation/save/recovery contracts and explicit user approvals. Raw form drafts must remain separate from valid gameplay values. Visual previews do not implement production behavior.
- Current scope: drafting and review; no approval of new fields/layouts inferred from this claim. A05 remains Active until required review and reconciliation finish.
- Initial deliverables: `UI_EDITOR_CONTRACT.md` drafts R01–R05 (save/validation, shell/visuals, management/recovery, content fields, preparation/progression/shop workflows). Thread preview `a05-interface-review.html` includes Home, Play, World Manager, entity input states, appearance controls and player-window presentation. Local headless Edge checks and inspected light/dark/invalid-input screenshots pass; no page overflow at 320/736/1024/1920px. These verify the mock only. Direct user review, complete content field schemas and remaining screen approval are outstanding; no A05 completion claimed.
- First user review: save only on leaving a field or Enter, rejecting timer/debounce saves. Keep the general arrangement but replace floating retained/pinned inspection with a bottom dock visible without scrolling the workspace. Contract/source revisions recorded; revising the preview. Multiline key handling and internal long-content navigation asked separately; no broad approval of unreviewed fields/palette/dimensions.
- Revised preview/QA: bottom inspector dock with section and pin/selection tabs; fixed active header and independent sheet content scroll. Desktop preview fits without document scrolling, dock position unchanged during sheet scroll, timer does not save, Enter/blur commit, invalid HP and error/retry behavior checked. Remaining responsive/local checks pass. A05 stays Active pending remaining review; exact dock dimensions/tabs and fields are still proposals.
- Further approvals: multiline Ctrl+Enter/field-departure commits, Enter newline; long dock content scrolls internally with fixed header/workspace. Failure/conflict retains text and warns before world exit unless resolved or explicitly abandoned; document fields/editable quest statuses and name/tag limits approved. Updating preview demonstrations and continuing R01–R05 review; A05 remains Active.
- Dock approval and latest QA: full-width dock, creature/pin and five section tabs, 230px default/180–420px adjustable height, fixed header/internal scrolling approved. Local multiline newline/commit checks and long-inventory scroll checks pass. Creature-field list and HP validation questions still pending; no broad R04 approval.
- Latest requested changes: HP beside creature name (placement scope being clarified); player initiative becomes horizontally scrollable turn queue, with projecting arrow tab for up/down collapse (top/bottom anchoring being clarified). Unknown visible identities show `unknown`; hidden entities remain absent. Replacing obsolete public left-list preview/spec; storyteller initiative unchanged, enemy exact HP remains private.
- Queue preview QA: expanded/collapsed states and arrow accessibility, contained horizontal scroll at 320/736/1024px, unknown-name/initials replacement and absence of enemy numeric HP checked; dark screenshots inspected. Header HP independently follows inspected/active creatures. Full existing mock checks pass. Top anchor and header-versus-initiative HP scope remain provisional pending user answers.
- Clarification approved: top-mounted player turn queue, arrow tab below, collapse upward/expand downward; HP beside creature-sheet/inspector header names only, not initiative entries. Updating standalone sheet header to match. Creature-sheet field inventory and HP validation remain outstanding.
- Header follow-through: standalone entity-sheet title now also shows HP, and mock valid HP commits update sheet/inspection/public-party headers while invalid drafts retain the previous value. Local checks pass; existing queue/dock/multiline/error checks remain green. General numeric syntax joined the pending creature-field/HP review; no additional approvals inferred.
- Visual baseline accepted: user approves current preview as a good baseline and likes its minimal color scheme. A05 remains Active for non-graphical editor/schema/validation and functional workflow review. Remaining functional scope is consolidated in UI_EDITOR_CONTRACT.md; no blanket field or HP/numeric approval inferred. Continue functional planning without requiring more aesthetic rounds.
- Scope extension authorized October 27: user requests finishing functional A05 and moving S01 outside MVP, likely first afterward. Additional exact documentation write paths: `CONTENT_DATA_PLAN.md`, `ARCHITECTURE.md`, `README.md`, `IMPLEMENTATION_STATUS.md` (scope note only; preserve A03 evidence). Audit downstream catalog/automation dependencies so S01 is not merely relabeled while still gating MVP. Source-specific dependent scope is being clarified; no acquisition or production edits authorized by this planning change.
- Scope clarification after dependency explanation: user permits acquisition/data-dependent work to remain in MVP because the planned product uses it. Retain S01/A02/S02/S03 and existing downstream dependencies; no post-MVP split was applied. Schedule S01 after independent foundation planning if desired, but before catalog-dependent milestones. Creature/input baseline approved. Shop denomination must be gold, not copper; revising valuation fields accordingly. No acquisition performed in this A05 task.
- Currency precision decision: user requires integer gold; explicitly priced item bundles may compensate for lower per-item values. Removed two-decimal gold proposal. Defined bundle count, units per priced bundle, physical quantity and whole-gold stock arithmetic; generator additions remain one priced unit/bundle with existing probability semantics. Source prices needing mapping retain provenance and must not be silently rounded or bundled. Final library/progression and broader functional-contract review questions remain open; A05 stays Active.
- Repository handoff authorized by user: preserve review source and portable local QA in `docs/design/a05-interface-review.html`, `docs/design/check-a05-preview.cjs`, and `docs/design/README.md`; these additional exact write paths are design evidence, not production app files. Commit planning decisions and review artifacts. A05 remains Active in this chat for the explicitly pending final workflow/contract reviews.
- Handoff verification: saved mock checks pass using `node docs/design/check-a05-preview.cjs` in headless Edge (sandboxed browser-profile launch failed; rerun outside the sandbox passed). Outputs stay in ignored `test-results/a05-review/`. Reconciled stale A01 status in implementation handoff/reporting, retained S01 MVP dependencies, and added the ready parallel-work table above. No production runtime change or new task claim.

**A01 — completed by Codex — A01 product-contract chat (this chat), October 27, 2026.**

- Exact write paths: `WORK_BOARD.md`, `ARCHITECTURE.md`, `PROJECT_PLAN.md`, `WORLDS_AND_SESSIONS.md`, `DATA_AND_RECOVERY.md`, `APP_NAVIGATION.md`, `GRAPHICAL_DESIGN.md`, `PROPOSED_DETAILS.md`, `PLANNING_INDEX.md`, `IMPLEMENTATION_PLAN.md`.
- Completed dependencies / authorization: no task prerequisites; planning gate open; user explicitly requested the next To Do task be claimed. A03 is Complete; no competing Active claim is recorded. Working tree was clean at claim time.
- Interface inputs and consumers: ARCHITECTURE.md section 14 and current product specifications; A04, A05, B01 and (with S01) A02 consume the resolved contract.
- Intended evidence: one explicit state/ownership/behavior contract, reconciled legacy notes, and clearly excluded unresolved items as required by A01's acceptance row.
- Current blocker / question: none within A01's approved state/ownership/behavior scope. Remaining task-specific criteria are explicitly excluded/assigned in the contract and ARCHITECTURE.md section 14. The dated review entries below record the decision sequence; their former pending questions are resolved by the final approval entry.
- Partial-work handoff (October 27, 2026): work begun. User approved In Progress / Complete, focus-only pause/switch, present-state Resume, and new shared-record reservation acquisition only at successful Start. Recorded state/action contract and acceptance cases in WORLDS_AND_SESSIONS.md; decision register in ARCHITECTURE.md section 14; corrected stale movement, world hierarchy, retention and implementation-authorization wording. No production code changed.
- Further decisions (October 27, 2026): shared-NPC timed effects follow the campaign of most recent interaction; locations hold shared facts, templates reusable layouts, encounters their own map/combat state, and NPC HP/inventory/effects stay canonical. Recorded approved boundaries and remaining questions in WORLDS_AND_SESSIONS.md and ARCHITECTURE.md; clock-interaction definition, rules input/grouping and preset arithmetic are awaiting user review.
- Subsequent approvals (October 27, 2026): clock handoff requires a committed gameplay interaction and preserves remaining duration; view/browse/drafts do not transfer. User approved labeled manual input/missing critical prompts, whole-action undo, separate overspend, storyteller trigger ordering, and preset calculation/rounding/clamps/damage/save-DC rules. Contract and acceptance cases recorded in WORLDS_AND_SESSIONS.md; proposal status and architecture register updated. Session creation membership, placement/cardinality, restore prefix and turn-relative handoff remain unresolved.
- Final approvals/integration (October 27, 2026): reserve party at creation; one current encounter placement per creature with explicit moves; multiple templates per location; exact historical prefix/state/status/reservation restoration in a separate world; freeze all completed-session fields; explicit storyteller turn-trigger handoff before transfer commit. Reviewed/reconciled current contract, architecture, recovery, navigation, project and proposal wording. Completion evidence and downstream exclusions are recorded below; no production code changed.
- Board verification: 50 unique task IDs, valid statuses/dependency references and no dependency cycles. Prerequisite-ready To Do IDs: S01, A04, A05, B01; S01's acquisition gate still applies. Documentation diff whitespace check passes.

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

- **B01 | Codex — B01 implementation chat | October 27, 2026:** strict versioned request/result unions, UUID/record/session/reservation/placement/formula schemas, role-specific preloads, registered top-frame host checks, serialized engine world binding and structured record-version conflict validation. Exact implementation/consumer contract in `docs/contracts/B01.md`. `npm run check` passes TypeScript and 12 tests; `npm run package` and the expanded packaged `npm run test:e2e` pass from the isolated worktree. Invalid schema/sender/role/world input is rejected, result correlation/binding checked, public privacy and window reopen retained. No dependency/lockfile changes. Session commands are defined but return `UNSUPPORTED_OPERATION` until B04–B06 install durable handlers; B02 storage, transactional idempotency, lifecycle/reservation policies, full content schemas and rules remain later tasks. B02 is prerequisite-ready upon integration; no dependent task claimed.

- **A01 | Codex — A01 product-contract chat (this chat) | October 27, 2026:** direct user approvals recorded in this chat; consolidated state/action table, ownership/timer/rules/preset contract and acceptance cases in `WORLDS_AND_SESSIONS.md`; exact recovery prefix/status/reservations in `DATA_AND_RECOVERY.md`; downstream exclusions and consumers in `ARCHITECTURE.md` section 14. Reconciled `PROJECT_PLAN.md`, `APP_NAVIGATION.md`, `PROPOSED_DETAILS.md`, `PLANNING_INDEX.md` and this board. Manual consistency review and `git diff --check` pass. No runtime tests needed for documentation-only changes; acceptance examples specify future behavioral tests, not executed production evidence. A04/A05/B01 become prerequisite-ready, A02 still needs S01. A04 numeric/hardware criteria, A05 fields/UI, B03/E02 format limits, C03/C04 recovery presentation/archive checks and actual catalog/mechanics coverage remain explicitly excluded and must be resolved/validated by their task owners.

- **A03 | Architecture implementation chat | October 27, 2026:** exact files and evidence in `IMPLEMENTATION_STATUS.md`; pinned Electron 45/Forge 8/Vite 8/React 19/Pixi 8/native SQLite and sharp workspace; `npm run check`, `npm run package`, `npm run test:e2e` pass. Packaged native backups/tiles, WebGL and isolated windows verified. No product-state/geometry/editor approval inferred. A04 and B01 still require A01 before they are eligible; no dependent task claimed.

- **P01:** ARCHITECTURE.md and IMPLEMENTATION_PLAN.md written as recommended technical baseline and acceptance-based build sequence; no package compatibility proof claimed.
- **P02:** CONTENT_DATA_PLAN.md records source selection and the offline ingestion plan. S01 records the acquired snapshot and audit.
- **S01 | Codex — S01 implementation chat | November 6, 2026:** integrated source commit `78a9ce0` with 77 verified upstream files, 6,743 SRD fixture rows, attribution, and the 5.2.1 gap audit. Offline verification and six audit tests passed. [Completion evidence](docs/content/S01_HANDOFF.md).
- **P03:** WORK_BOARD.md added; all implementation tasks assigned explicit dependencies, gate and initial status; no Active implementation claim or fabricated validation. Dependency consistency/cycle checks recorded by this planning update.

Future completion entry: `Task | Owner | Date | Commit/files | Behavioral/test evidence | Remaining limitations/new task IDs`.
