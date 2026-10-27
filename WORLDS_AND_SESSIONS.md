# Worlds and session-owned history

Status: active requirements discovery. User revision on October 26, 2026. This document supersedes earlier single chronological campaign-action-history and same-record completed-session reopening requirements. It does not authorize implementation.

## 1. Confirmed changes

- Add a World layer above Campaign. Campaigns share canonical live NPCs, locations, and related records: death, inventory changes, destroyed locations, and other world-state mutations in one campaign affect the others. These are not independent campaign snapshots of world entities.
- Navigation is approved: each campaign belongs to one world; the chooser lists worlds and their campaigns; New Campaign selects an existing world or creates one. Normal launch still restores the last campaign/tabs. World provides shared NPC/location tools and a session list.
- Add a World Manager with Overview, Campaigns, Characters & NPCs, Locations, Lore, Sessions, and World Settings. Use searchable lists/details editors, accessible from the world chooser and a World Manager button beside the campaign switcher. Reserved records are read-only there, showing their owning session and an Open Session action; edits go through that session.
- Sessions own their own action histories. Campaign/world history is a list of sessions rather than one flat authoritative action log.
- Completed-session continuation creates a new session linked to the completed session. Do not reopen and append actions to the completed record.
- New and continued sessions use present persisted world/campaign state. Continue does not restore an older ending state. User accepts omission of continuation if necessary to keep MVP manageable; the approved simple target is a new current-state session with a reference link, not a historical restore system.
- Branching history is a future feature, not MVP scope. A continuation link must not silently imply a restored historical state, alternate timeline, or branch.
- Keep session controls on Home/top bar: New, Continue/Resume, Mark Complete, Switch Session, with selected session displayed. Adjust these labels/actions to the revised model below.
- One party per campaign remains MVP scope. Adding multiple campaigns to a world does not authorize multiple parties within one campaign.
- Undo stops at the current session's start, while crossing turns/areas inside that session. No cross-session rewind in MVP. Completed-session replay is read-only; corrections to old outcomes are new actions in a new/current session.
- History is finalized when a session is marked Complete. Starting a new session while a previous session is incomplete prompts Complete Previous or Leave Incomplete; do not force completion.
- Shared records become reserved when included in an active session, not merely because they exist in the world library or are mentioned in a note. Block use in another session; earlier approved release rule remains completion of the owning session. Reserved records can be browsed read-only in World Manager; edits go through their owning session. Paused/incomplete-session lifecycle terminology still needs a precise state table.
- Block undo when it would overwrite newer changes from another session; offer a new corrective action against current state. Session-bound undo does not grant permission to overwrite canonical changes made elsewhere. Extend this validation to redo before implementation.

## 2. Proposed conceptual hierarchy

Confirmed clock/portability scope: each campaign has its own game clock. Shared world changes apply in action order, without synchronized dates. Real-world waiting never advances game time. MVP portability is full-world export/import only, including campaigns and required shared records/assets/session histories. Standalone campaign portability is deferred, superseding earlier requirements. Do not implement a synchronized world clock.

| Scope | Confirmed responsibility | Still to define |
| --- | --- | --- |
| Application/global library | Reusable versioned definitions/assets, app settings | Relationship to world-owned definitions and export dependencies |
| World | Contains campaigns; grouped chooser; approved seven-section manager; session list; live records reserved by active-session membership; reserved manager records read-only | Clock, storage ownership, exact manager layout |
| Campaign | One party, prepared areas/encounters, sessions | References to world records, campaign-specific overrides, export scope |
| Session | Own history; start in present; optional continuation link; bounded undo with conflict checks; finalized on completion | Reservations and active/session-switch UI |
| Encounter/area instance | Map and combat state used during play | Session persistence, shared-record identity, checkpoint ownership |

This is a conceptual map, not a final database schema or permission to create isolated party state for every session.

## 3. Decisions required before history/storage implementation

1. Define which entity/location fields are canonical world state versus per-encounter placement, camera, initiative, and temporary combat context. Canonical live sharing is confirmed.
2. New/Continue uses present state; historical branching/restoration is deferred. Specify only continuation link/label and session initial checkpoint needed for replay.
3. Undo blocks overwriting newer external session changes and offers corrective actions. Define dependency checks, redo validation, and corrective-action UI; never force-delete newer session history.
4. Multiple sessions may remain incomplete; starting another prompts Complete or Leave. Inclusion in an active session acquires reservation, with completion as previously approved release rule. Define session state terminology, draft-versus-active membership, recording focus, and resume behavior.
5. World Manager edits unreserved world records; reserved records are read-only with owning-session/Open Session. Define unreserved-record version history, save status and recovery; do not silently drop edits from record history.
6. Campaign clocks are independent; shared-record changes apply in action order. Specify timer ownership on shared records, staging conflicts, full-world archive/recovery contents and replay dependencies without synchronizing dates.

## 4. Session control semantics to finish

- **New:** create a session with its own history from present persisted world/campaign state; prompt Complete Previous or Leave Incomplete when applicable.
- **Resume:** continue an existing incomplete session; no independent party duplication is implied.
- **Continue:** create a new linked session from present state. Preserve the completed source history; no historical restore or branch in MVP. Low priority if scope needs reducing.
- **Mark Complete:** finalize its action history; do not implicitly reset HP/effects/areas or advance time. Any notes/metadata edit allowance after completion still requires specification.
- **Switch Session:** choose another record/context without silently completing others. Whether switching can resume an old live recording against newer shared state needs resolution.
- **History & Replay:** world/campaign views list sessions. Session replay reads its own history and sufficient recorded context; never replays into live state.

### Shared-state blocking and historical replay

- Adding shared player/location/NPC records to an active session acquires reservations. Before allowing another session to use them, check ownership and block overlap until completion; no Continue Anyway. Show the owning session and a route to inspect/complete it. Mere library presence/reference links do not reserve records. World Manager permits read-only browsing of reserved records and provides Open Session; editing happens through the owning session.
- Shared-record blocks must not be bypassed by map generation, staged setup, imports, or different campaign navigation. Specify enforcement and draft conflict behavior before implementation.
- Historical replay needs recorded snapshots/versions sufficient to show what existed at the time, even after canonical shared records change. A frozen history must not display current NPC HP/location values as if they were historical outcomes.

## 5. Confirmed examples

1. Complete session A, then Continue A after session B changes a world NPC: create linked session C with the NPC's present state, not A's recorded ending state.
2. Leave A incomplete with an NPC/location in use, then start B: B cannot use those shared records until A is completed. Starting B does not silently complete A.
3. Attempt an undo that would replace a newer external-session change: block it, retain both histories, and offer a current-state corrective action.
4. Replay completed A after later world changes: show recorded historical state without editing canonical world records.
5. Open an NPC reserved by A in World Manager: show current details read-only, ownership by A and Open Session. Do not enable a direct manager edit or an override that bypasses the reservation.

## 6. Handoff requirement

World navigation, reservations, manager structure/access, independent campaign clocks and full-world-only portability are confirmed. Remaining boundaries include lifecycle terminology, unreserved-record version history, shared-effect timer ownership, archive/recovery details and exact screen layout.

After these decisions are settled, consolidate PROJECT_PLAN.md, APP_NAVIGATION.md and unapproved proposals to remove obsolete flat-history wording. Until then, this explicit revision takes precedence. Do not implement either history model while the unresolved boundaries above remain open.

## 7. Future world simulation — explicitly outside MVP

The user would like an economy that responds to player actions: for example, destroying a bridge could disrupt trade, supply, availability, or prices. This is a far-future concept, not a requirement to implement an economy, transport simulation, automatic trade routes, cascading consequences, or shop-price/restock simulation in MVP. Preserve this idea for later design; do not infer formulas or implementation dependencies from it. MVP loot/shop rules remain the approved budget/table generator and persistent editable stock.

## 8. Clock and portability acceptance checks

Recovery/import follows DATA_AND_RECOVERY.md: import/restore create separate worlds, original world/later history stays unchanged, backup before restoration and session start, durable content/game history included and transient UI excluded. Delete sends world plus associated backups to indefinite Trash; Empty Trash lists contents and requires confirmation. Recovery is distinct from present-state session continuation and deferred gameplay branching.

1. Advance campaign A's game time: campaign B's clock stays unchanged. An explicit shared-NPC mutation from A nevertheless appears in B; do not reconcile dates automatically.
2. Export/import a full world on a clean installation: verify campaigns, shared identities/links, party state, session histories/replay, areas/staging and required images remain usable offline. Archive contents and import overwrite/identity policy still need specification.
3. Data & Backups offers world export/import, not standalone campaign packages. Existing campaign-folder opening is not a portable export feature.
