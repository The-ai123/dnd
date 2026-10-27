# Planning handoff — read first

Status: implementation authorized by the user, starting with architecture. A03 is complete: the packaged Windows two-window shell, SQLite backup, sharp tiles and Pixi WebGL pass compatibility tests. See IMPLEMENTATION_STATUS.md for evidence and limits. Remaining product behavior and dependent implementation tasks are still open.

Architecture handoff: read [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries, storage/history/recovery, rules/map/public projection and unresolved decisions. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) supersedes earlier coarse build sequences with dependency-ordered tasks and acceptance evidence. The tested scaffold and pinned dependencies are documented in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

**Agent execution entry point:** [WORK_BOARD.md](WORK_BOARD.md) is the single source for **To Do / Active / Complete**, task owners, prerequisite IDs, authorization gates and safe parallel-work claims. Read it before choosing work. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) supplies acceptance criteria; phase letters are categories rather than full-phase barriers. A03 is verified; production storage, history, recovery, geometry and rules are not implemented by its fixtures.

**A05 review in progress:** [UI_EDITOR_CONTRACT.md](UI_EDITOR_CONTRACT.md) proposes shared input/save rules, exact screen/list/editor fields, dimensions and workflows in five review groups. New details are unapproved until their review log records direct user decisions. Existing A01/navigation/graphical behavior still takes precedence; the interface preview is review material, not production implementation.

A05 first review: user keeps the general layout but replaces floating retained/pinned inspection with a fixed bottom dock, and specifies editor saves only on field departure or Enter, without timer saves. This supersedes earlier floating-panel and save-as-typed wording. Multiline key handling, long dock content and remaining field/visual review stay open.

A05 follow-up: multiline Enter adds a line; Ctrl+Enter/field departure commits. Long content scrolls within the fixed dock. Failure/conflict recovery, document fields/quest statuses and name/tag limits are approved in UI_EDITOR_CONTRACT.md; other screen/field/visual details remain under review.

A05 display clarification: player initiative is a horizontally scrollable turn queue at the top, with a tab below that collapses upward/expands downward. Unknown visible identities show `unknown`; hidden entities remain absent. HP sits beside names in creature-sheet/inspector headers, not initiative entries. This supersedes the old public left-list layout.

**A01 contract, October 27, 2026:** [WORLDS_AND_SESSIONS.md](WORLDS_AND_SESSIONS.md) consolidates the approved session states, immediate party reservation, private staging/Start boundary, canonical/template/encounter ownership, single current creature placement, clock/turn handoff, roll/resource handling and preset arithmetic. All completed-session fields are frozen. [DATA_AND_RECOVERY.md](DATA_AND_RECOVERY.md) defines exact historical-state/prefix restoration with then-current statuses/reservations in a separate world. ARCHITECTURE.md section 14 assigns remaining geometry, image-format, editor/catalog and recovery presentation details to their own tasks; no blanket proposal approval is implied. Status/evidence is maintained in WORK_BOARD.md.

**Dataset source:** [CONTENT_DATA_PLAN.md](CONTENT_DATA_PLAN.md) adopts published Open5e 2024 JSON with a pinned commit, attribution and an explicit SRD 5.2.1 parity audit. Source snapshot acquisition, normalization/offline bundling, and mechanics automation are separate S01/S02/S03/F05 tasks. No scraping or runtime API dependency is planned; the raw snapshot has not been acquired by this planning task.

Latest scheduling clarification: after considering post-MVP S01, the user permits it to remain in MVP because planned catalog/editor/progression work consumes the data. Dependencies remain intact; independent foundation work can precede acquisition. A05 creature/input baseline is approved; shop valuation is gold, not copper, with remaining functional details under final review.

Currency refinement: gold amounts are integers, with explicit priced bundles allowed to compensate for cheaper individual items. No fractional-gold/copper conversion or silent source-price rounding. UI_EDITOR_CONTRACT.md defines priced-unit quantity versus physical-item quantity; remaining final functional approvals are still pending.

## Current sources

| Read order | Document | Responsibility |
| --- | --- | --- |
| Start | WORK_BOARD.md | Status/owner/dependency authority; eligibility, parallel lanes and claim/handoff rules |
| Execution detail | IMPLEMENTATION_PLAN.md | Per-task deliverables and completion evidence |
| Content lane | CONTENT_DATA_PLAN.md | Open5e pinning, provenance, patch parity, adapter, offline bundle and coverage boundaries |
| 1 | PROJECT_PLAN.md | Product requirements, rules scope, scale limits, dependency-ordered roadmap and acceptance examples |
| 2 | WORLDS_AND_SESSIONS.md | World/campaign/session ownership, canonical shared records, reservations, clocks, session history/undo |
| 3 | DATA_AND_RECOVERY.md | Durable history coverage, backup gates, separate-world import/restore and Trash |
| 4 | APP_NAVIGATION.md | Launch, Home tools, World Manager, tabs, staging, shops, settings and transitions |
| 5 | GRAPHICAL_DESIGN.md | Approved interface direction and remaining visual choices |
| 6 | PROPOSED_DETAILS.md | Movement section approved with later key/history revisions; all other behavior remains proposal unless confirmed elsewhere |

Later direct user decisions override older wording. For history/recovery/navigation, use the dedicated current documents above rather than obsolete requirements retained in the main plan's chronological review notes. Consolidation is ongoing; do not implement contradictory text or silently promote proposals.

## Settled model most likely to be misread

- World contains campaigns; each campaign has one party in MVP. World NPC/location records are canonical live state across campaigns, unlike reusable global-library definitions copied/versioned into campaigns.
- Session owns its action history. Campaign/world history lists sessions; this is not the original flat campaign action log.
- Continue completed session creates a new linked session in present state; completed history is finalized. Gameplay branching is future scope.
- Session undo crosses its turns/areas, not its start; block overwriting newer external changes. World recovery is a separate operation creating a new world, not an undo bypass.
- Active-session membership reserves shared records until completion under the current rule. World Manager shows reserved records read-only with owning session/Open Session.
- Campaign clocks are independent. World mutations apply in action order without date synchronization.
- Launch restores campaign/tabs/last focus, not always Home. Two public/private views are two separate windows.
- New-map selection freezes players with Selecting new map; autosaved private setup survives restart; Start commits staged changes together and publishes an independent player-camera preview. Cancel resumes old live view with Keep Draft or confirmed discard.
- W adds movement waypoints. Space toggles hovered inspector pin. Q closes oldest pin; Alt+Q closes all; Shift+Q restores last closure/batch. Bare Alt release toggles map detail; Alt chords do not.
- New Session and Restore require a successful backup. Failure blocks with explanation/Retry/Choose Backup Folder, leaving current state unchanged.
- Full-world portability only. Import and history restore create separate worlds. Restore first backs up source; source/later history stay unchanged.
- Durable content/game changes belong in history; hover/inspector/tab-focus presentation does not. World deletion moves world and associated backups into indefinite Trash; Empty Trash lists contents and requires confirmation. No fixed 20-point/7-day pruning policy is approved.
- Settings sections are Appearance & Density, Controls, Player Window, Storage & Recovery, Rules & Defaults, About & Attribution.

## Remaining specification and implementation gates

1. Follow the approved A01 contract and downstream exclusion register in ARCHITECTURE.md section 14. A04 must agree and prove routing/performance criteria; A05 must approve exact fields/layouts/validation; B03/E02 must establish image-format/decoder limits; C03/C04 must specify archive validation, collision handling and recovery presentation. Do not silently promote remaining proposals.
2. Follow S01/A02/S02/S03 in WORK_BOARD.md to pin/audit Open5e, enumerate SRD 5.2.1 content/exclusions and create the validated offline bundle. Define per-entry mechanics acceptance; F05 full enabled coverage is a separate release gate.
3. Specify exact content/entity/item/spell/condition/character-option editors, progression choices, field validation and library version/update dependencies.
4. Specify management-screen columns, filters, preview actions, record editing, empty/error/recovery states, notes/quest fields, shop valuation/draft lifecycle and settings fields.
5. Use the accepted A05 visual baseline in `docs/design/a05-interface-review.html` and the approval state in UI_EDITOR_CONTRACT.md; do not restart aesthetic review. Runtime 1080p–4K/mixed-DPI/accessibility checks and unshown combination states remain implementation validation. Older wireframes are superseded by the bottom dock/top player queue/header HP revision.
6. A01's consolidated state/ownership/behavior contract takes precedence over legacy review notes. Continue refining the task-specific fields/UI/catalog and evidence listed above; A01 completion does not claim zero unresolved product details.
7. Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md. A03 packaged compatibility and dependency pinning are complete; remaining work includes product-gap resolution, A04 geometry feasibility and production version/schema contracts.
8. Implementation authorization is satisfied by the user's instruction to implement the plan, starting with architecture. Continue to honor task dependencies and obtain actual product decisions where the specifications identify unresolved behavior.

## Implementation dependency order after planning

1. Offline two-window skeleton and private/public boundary.
2. Stable world/campaign/entity identities, session histories, durable revisions, reservations and persistence.
3. Required backup/recovery/import/Trash gates and outer navigation shell.
4. Assets, versioned content editors, presets/variants, area templates and staged setup.
5. Map rendering/editing, geometry/pathing, cameras, token interaction and measurement.
6. Turns, conditions, triggers, clocks and action/resource tracking.
7. Guided progression and complete enabled SRD automation in incremental tested slices.
8. Complete visibility/management tools/replay, visual QA and end-to-end offline release validation.

This order does not authorize implementation or substitute for the still-required detailed task breakdown. Preserve recovery/history dependencies before adding features that mutate durable game state.
