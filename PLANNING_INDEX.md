# Planning handoff — read first

Status: implementation authorized by the user, starting with architecture. A03 is complete: the packaged Windows two-window shell, SQLite backup, sharp tiles and Pixi WebGL pass compatibility tests. See IMPLEMENTATION_STATUS.md for evidence and limits. Remaining product behavior and dependent implementation tasks are still open.

Architecture handoff: read [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries, storage/history/recovery, rules/map/public projection and unresolved decisions. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) supersedes earlier coarse build sequences with dependency-ordered tasks and acceptance evidence. The tested scaffold and pinned dependencies are documented in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

**Agent execution entry point:** [WORK_BOARD.md](WORK_BOARD.md) is the single source for **To Do / Active / Complete**, task owners, prerequisite IDs, authorization gates and safe parallel-work claims. Read it before choosing work. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) supplies acceptance criteria; phase letters are categories rather than full-phase barriers. A03 is verified; production storage, history, recovery, geometry and rules are not implemented by its fixtures.

**Dataset source:** [CONTENT_DATA_PLAN.md](CONTENT_DATA_PLAN.md) adopts published Open5e 2024 JSON with a pinned commit, attribution and an explicit SRD 5.2.1 parity audit. Source snapshot acquisition, normalization/offline bundling, and mechanics automation are separate S01/S02/S03/F05 tasks. No scraping or runtime API dependency is planned; the raw snapshot has not been acquired by this planning task.

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

1. Finish behavioral details still explicitly pending: session active/paused/complete state table, draft reservations, shared-effect timer ownership, invalid-input/overspend/roll grouping, preset arithmetic, and archive identity/history-prefix recovery.
2. Follow S01/A02/S02/S03 in WORK_BOARD.md to pin/audit Open5e, enumerate SRD 5.2.1 content/exclusions and create the validated offline bundle. Define per-entry mechanics acceptance; F05 full enabled coverage is a separate release gate.
3. Specify exact content/entity/item/spell/condition/character-option editors, progression choices, field validation and library version/update dependencies.
4. Specify management-screen columns, filters, preview actions, record editing, empty/error/recovery states, notes/quest fields, shop valuation/draft lifecycle and settings fields.
5. Resume graphical review: updated token/inspector/play previews, Home/World Manager/chooser tools, exact 1080p–4K dimensions and Comfortable/Dense/light/dark styles. Existing old wireframe is superseded in multiple details and is not an implementation reference.
6. Remove remaining obsolete review wording and assemble a single approved behavior checklist. Do not claim zero unresolved behavior while these gaps remain.
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
