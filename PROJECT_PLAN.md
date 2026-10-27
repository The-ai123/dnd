# D&D Game Host — Project Plan

Status: requirements discovery. This document is a working specification, not authorization to begin implementation. Unresolved decisions must be settled before their dependent work begins.

**Current execution organization:** read [WORK_BOARD.md](WORK_BOARD.md) for To Do / Active / Complete, ownership, explicit prerequisites and parallel-work rules. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) defines completion evidence. Published Open5e 2024 JSON is the selected planned dataset source; [CONTENT_DATA_PLAN.md](CONTENT_DATA_PLAN.md) defines pinned no-scrape acquisition, 5.2.1 parity audit, normalization and offline bundling. Dataset work does not automatically complete rules automation or authorize starting implementation.

**Current history/scope revision (October 26, 2026):** Read [WORLDS_AND_SESSIONS.md](WORLDS_AND_SESSIONS.md) first for history ownership. World now contains multiple campaigns sharing NPCs/locations/etc.; sessions own action histories; world/campaign history lists sessions. Continuing a completed session creates a new linked session. Branching history is deferred. This supersedes earlier flat campaign-action-history and same-record continuation wording throughout these planning documents; unresolved sharing/undo/state boundaries must be settled before consolidation or implementation.

Confirmed follow-up: shared world records are canonical/live across campaigns. Undo is session-bound and blocks overwriting newer changes from another session, offering corrective actions. Completion finalizes history. New Session prompts Complete Previous or Leave Incomplete; shared players/locations/NPCs are blocked until their owning incomplete session completes, superseding earlier warnings. New/Continue always uses present state; continuation creates a new linked session and never restores an old state. Reservation granularity and world navigation remain open.

World navigation is subsequently approved: campaigns belong to one world, chooser groups them, New Campaign selects/creates a world, normal restore remains last campaign/tabs. World Manager edits shared records; active-session inclusion reserves those records. Reserved-record manager edit policy and precise lifecycle terminology remain under review in WORLDS_AND_SESSIONS.md.

World Manager scope/access and reserved editing are now approved in WORLDS_AND_SESSIONS.md: seven sections (Overview, Campaigns, Characters & NPCs, Locations, Lore, Sessions, World Settings), searchable lists/details, chooser/top-bar access. Reserved records are read-only with owning-session/Open Session and edits through that session. Future reactive world economy (e.g. bridge destruction affecting trade/supply) is explicitly outside MVP; it does not change the approved loot/shop generator.

## 1. Purpose and design constraints

Current recovery revision: [DATA_AND_RECOVERY.md](DATA_AND_RECOVERY.md) confirms separate-world import and historical restore, preserving original world/later history; restore all durable content/game state, excluding transient UI. Back up before restore and new session start. Delete sends worlds plus associated backups to indefinite Trash; Empty Trash shows contents and requires confirmation. Fixed-count rolling-backup proposals are unapproved/superseded.

Latest clock/data scope: each campaign has its own clock; shared world changes apply in action order without synchronized dates. Full-world export/import is the only MVP portability. Standalone campaign export/import is deferred, superseding earlier campaign-portability wording.

Help one storyteller prepare and run D&D games with a private control display and a separate player-facing play area.

Confirmed constraints:

- D&D 5e, 2024 rules.
- Runs on one Windows PC, offline, with local files.
- Two displays on the same PC: storyteller controls and player view.
- Player-device connections are a possible later extension, not an MVP requirement.
- Automate supported attacks, spells, damage, saving throws, and effect expiry.
- When judgment or off-map information is needed, prompt the storyteller for rulings/choices, then automate all defined rolls, costs, effects, durations, and state changes. Do not attempt autonomous adjudication of narrative outcomes.
- Visually lightweight and practical. Prioritize readable information, compact controls, clear state, and direct manipulation.
- No decorative transitions, elaborate themes, or visual ornament for its own sake.
- Plan first. Do not select a stack or implement the app until requirements are resolved and the user approves proceeding.

## 2. Confirmed MVP capabilities

### Asset and entity storage

- Store and select images.
- Do not impose a fixed image dimension/file-size cap. Large-image handling must account for available memory, decoding, and GPU limits; the loading/rendering strategy remains an architecture decision. Local execution does not imply unlimited resources.
- Store characters/entities with maximum HP, current HP, spells, inventory, and additional attributes to be specified.
- Entity sheets support HP/temp HP, AC, abilities, saves/skills, speeds, attacks, spells/resources, inventory, defenses, senses, conditions, notes, and images. Exact field schemas and calculations remain open.
- Provide guided player character creation and leveling for levels 1–20, including multiclassing, its prerequisites, and progression. Bundle standard 2024 character options so the wizard is usable immediately. Exact bundled catalog and validation details remain open.
- Use SRD 5.2.1 character options, with editors for manually adding other options. Fully automate all enabled bundled features/spells. Features/spells requiring deferred lighting or special-sense simulation are unavailable until a later release; enumerate and clearly label these exclusions rather than silently falling back to manual resolution.
- Allow creation/leveling when a class/species grants a deferred feature. Clearly mark the feature unavailable, require acknowledgment, and retain all supported features. Do not block the entire character option.
- Creation offers point buy, standard array, app/manual rolled ability scores, and custom scores. At each level, support rolled or fixed HP advancement. The storyteller can override validation; define how overrides and their consequences are displayed and recorded.
- Entities can have status effects.
- Generate generic NPCs and enemies from presets.
- Support standard, weak, and elite variants that modify the underlying preset.
- Weak/elite variants use user-configurable modifier profiles for HP, AC, attack/save bonuses, damage, and speed, with per-entity overrides. Every supported number allows a multiplier plus flat adjustment; preview results before generation. Rounding, dice handling, and exact calculation order remain open.
- Bundle character options for the wizard; retain manual content editors for custom/additional definitions. Enemy presets/custom spells can be entered manually. Rules-content importing and standalone campaign portability are deferred; full-world export/import is required. Enumerate bundled content/deferred entries before implementation.

### Area preparation and play

- Save and select areas before a session.
- Party members retain HP, inventory, resources, and effects across areas. Each area preserves its own encounter state. Starting fresh creates a copy of the prepared area template rather than modifying the template.
- Place entities in an area and drag them to move.
- Toggle a grid and measure distances.
- Each square tile represents 5 feet. Store distances/positions as fractional values, supporting movement as small as 0.1 foot. Use geometric distance, including diagonals (one square diagonally is square-root-of-two squares). Do not quantize all movement to tile increments; display rounding and threshold tolerance remain to be defined.
- Pan and zoom the map; the area can extend beyond the visible viewport. Provide camera focus on player entities.
- Support imported map images and basic in-app drawing: shapes, lines, freehand, text, and image placement, with separate wall/door and terrain tools. Use an adjustable-scale square grid with optional snapping; grid visibility can be toggled independently.
- Provide snapping; holding Shift temporarily disables snapping while placing. Define exact snap anchors and which placement tools share this behavior before implementation.
- Typical areas span a few hundred feet. Maximum area footprint is 5,280 × 5,280 feet.
- Typical encounters contain a few dozen entities. Hard cap is 100 placed entities per running area; stored libraries can be larger.
- Use a 2D map with token footprints. Terrain costs apply along the movement path. Elevation is an editable number used by rules; no 3D renderer is required. Exact elevation effects on distance, collision, targeting, and vision remain to be specified.
- During dragging, draw an arrow indicating travel distance.
- Turn that arrow red when travel exceeds speed; allow the movement anyway.
- Accumulate movement across the current turn, following a path with waypoints and including terrain costs. Compare against the turn's movement allowance; exact allowance modifiers remain to be specified.
- Movement controls: drag previews a route, W adds a waypoint, release commits, Escape cancels, and Shift temporarily bypasses snapping. Automatic routing changes the straight preview as needed to avoid walls/obstacles. W supersedes the previously approved Space waypoint binding.
- Provide separate Around modes for lowest movement cost (including terrain) and shortest physical distance; both route around walls/obstacles using the token footprint. This interprets the user's request to add a mode for each optimization.
- Over calculates climb/jump/flying routes using obstacle heights and entity movement abilities, prompting for required rulings/rolls. The map remains 2D with numeric elevation. Height authoring, traversal selection, and exact costs require detailed specification.
- Through explicitly bypasses wall/solid-obstacle collision, with a visible warning and history record. It does not implicitly grant teleportation, disable terrain costs, or suppress movement-triggered effects; those details are proposed for review.
- R and mouse wheel cycle modes during a drag; a mode selector is visible only during movement. Outside movement, the wheel zooms. Proposed expanded cycle is Around—lowest cost → Around—shortest distance → Over → Through. No-route handling and exact cycle expansion are included in the pending detail review.
- Outside combat, movement has no speed budget. Only one token moves at a time in MVP; group movement is deferred. Collision rules still apply.
- Place obstacles and terrain modifiers.
- Walls and solid obstacles block token movement unless the storyteller explicitly overrides the restriction. This is separate from the non-blocking speed warning.
- Supported spells can create temporary terrain/obstacles/effects with timers.
- Combat supports app-generated rolls and manually entered roll results. Apply resolved outcomes immediately; use undo for correction. No mandatory confirmation before application.
- Track actions, bonus actions, reactions, and resources. Warn about invalid use but always permit execution. This does not remove required targeting/ruling inputs or explicit collision overrides.
- Pause automated resolution at eligible reactions and optional feature triggers; show available choices and continue after the storyteller chooses or skips.
- Required automation includes attack rolls, saving throws, damage/healing, conditions/stat modifiers, resource consumption, timed areas/terrain, recurring saves/damage, and concentration. Cover every enabled bundled feature/spell, excluding the explicit lighting/senses deferral list. Storyteller prompts supply judgment/off-map inputs. No promise of full automation for arbitrary user-authored mechanics is established yet.
- For area attacks/spells, show entities inside the template and let the storyteller include/exclude targets before resolution. Once targeting and required inputs are supplied, results apply immediately.
- Maintain a turn counter and initiative order.
- Roll initiative for entities and permit manual player initiative values.
- Use one initiative entry per creature. Rolls and order are editable; storyteller resolves ties. Zero-HP tokens stay on the map; storyteller chooses whether to skip/remove them from initiative.
- Record all encounter changes, including movement, HP, rolls, effects, terrain, and turns. Support undo and end-of-encounter replay in recorded order.
- Sessions own action histories; world/campaign history lists sessions. Undo restores a whole action and consequences across turns/areas within its session, never across completed-session boundaries, and blocks overwriting newer external-session changes. Redo uses recorded outcomes until a new action replaces the undone future. Completed-session Continue creates a new present-state linked session. No gameplay branching in MVP.
- Combat advances game time by rounds. Outside combat the storyteller explicitly advances game time. Real-world waiting never expires effects. Exact turn/round trigger timing and inactive-area clock behavior remain to be specified.
- Replay provides play/pause, speed selection, step forward/back, and seek. Player replay respects historical visibility; storyteller replay can inspect everything. Cameras remain independently controllable, and replay does not mutate live state.

### Campaign persistence

- Organize local data into campaigns containing parties, areas, and encounter history.
- Autosave completed actions and typed preparation edits. Back up before New Session and Restore; backup failure blocks operation with Retry/Choose Backup Folder and leaves current world unchanged. Full-world import/restore creates separate worlds; standalone campaign portability is deferred. Delete worlds/backups to indefinite Trash, emptied only by explicit confirmed action. Fixed rolling retention is not approved.
- Preserve history and encounter state across application restarts. Exact backup retention, packaging, crash recovery, and migration rules remain to be specified.

### Storyteller and player displays

- Storyteller display includes private information, entity stats, and encounter controls.
- Support monitor resolutions from 1080p through 4K. Physical monitor dimensions and Windows display scaling must not determine game-world distances.
- Player display shows the play area.
- MVP automatic visibility uses walls/doors that block sight and configurable sight radius. Lighting and special senses are deferred.
- Player view combines all party members' vision. Explored terrain remains dim outside current sight; enemies outside current sight disappear.
- Storyteller and player cameras are independent. Provide explicit controls to focus one player or frame the party.
- Other player display content and private/public information rules remain to be defined.
- Default player display shows map/tokens, public names, conditions, initiative/current turn, movement arrows, and spell templates. Show numeric HP for party members only; enemy HP numbers are private. Exact hide/override behavior remains open.
- Latest token decisions: public health-band colors for all visible entities; exact HP on selection only, restricted to party HP in player view. Always show names for visible entities; hover raises the hovered token above stacked entities and dims others. Conditions use top-edge icons with overflow and hover names/timers. Active-turn frame/TURN, dashed inspection corners, and numbered target badges can coexist. See GRAPHICAL_DESIGN.md for pending details.
- At zero HP, use the same theme-dependent black/white outline as dead tokens, but keep the token opaque unless death is confirmed. Only confirmed death applies persistent translucency; hover dimming remains a separate interaction.
- Stack selection uses repeated clicks at the overlap to cycle through eligible entities in storage order, wrapping at the end. Selection synchronizes only from player window to storyteller window; storyteller selection does not update player selection. Cameras remain independent and selection does not advance initiative.

## 3. Working vocabulary

These definitions organize the plan; confirm them before implementing the storage model.

| Term | Proposed meaning |
| --- | --- |
| Asset | A locally stored image used by maps, portraits, or tokens. |
| Entity | A persistent character, NPC, enemy, or other tracked creature. |
| Preset | A reusable source definition for generating entities. |
| Variant | Explicit modifications applied when generating an entity, such as weak or elite. |
| Area template | A saved location prepared for later play. |
| Encounter | A running instance of an area with entity state, turns, and history. |
| Effect | A condition or mechanical change, optionally with duration and a source. |
| Spell definition | Structured targeting, rolls, effects, duration, and optional placed geometry. |
| Event | A recorded encounter change used for undo and replay. |

## 4. Decisions still required

Keep the answer to each question here as it is resolved. Never silently treat an unanswered question as an accepted default.

### Content and automation

- Define manual content editors and their structured behaviors. Bundled character options come from SRD 5.2.1; enumerate the actual catalog and dependencies. Later imports must feed this same model; no import source is selected for MVP.
- Every enabled bundled feature/spell requires complete automation for release. Enumerate every SRD catalog entry and mark it enabled or deferred with a reason. Lighting/special-sense-dependent entries are unavailable in MVP. Characters with deferred features remain valid: label those features unavailable and require acknowledgment while keeping supported features usable. Define dependency propagation and acknowledgment scope.
- Guided creation/leveling covers levels 1–20 and multiclass prerequisites/progression. Offer point buy, standard array, app/manual rolled scores, and custom scores, plus rolled/fixed HP per level. Storyteller can override validation. Define validation details, advancement choices, respec/rollback, and custom option integration.
- Specify field schemas, derived values, and editing behavior for the confirmed entity sheet categories.
- Every supported modifier number accepts a multiplier plus flat adjustment, with a preview before generation. Define calculation order, rounding/clamps, damage-dice handling, save bonus versus save DC, profile precedence, and how edits affect existing generated entities.
- Define manual roll entry semantics (raw dice versus totals), advantage/disadvantage, criticals, failed input validation, and whether each multi-target resolution is a single undoable action. Rolls/results apply immediately, with undo available.
- Area targeting lists entities within the template with storyteller inclusion/exclusion before resolution. Define shape/size options, boundary inclusion, coverage of large tokens, friendly targets, range/cover/line-of-effect checks, and visibility of target previews.
- Concentration and recurring saves/damage are confirmed automation requirements alongside attack/save resolution, damage/healing, conditions/stat modifiers, resources, and timed areas/terrain. Reaction/optional-feature triggers pause resolution for a choice/skip. Track action economy/resources and warn without blocking invalid use. Define trigger ordering, nested reactions, eligibility, stacking, defenses, interruptions, negative-resource handling, and manual overrides.
- Unsupported custom content needs an agreed manual workflow. Enabled bundled features/spells must not silently fall back to manual mechanical resolution. Storyteller prompts supply rulings/choices, after which the app resolves defined mechanics. Lighting/senses exclusions are explicitly unavailable rather than partially automated.
- Confirm data provenance and redistribution permissions for any bundled/imported content before including it. Rules details must be checked against authoritative material during specification.

### Areas, geometry, and movement

- Define vision sources/party membership, radius units, door controls, wall authoring, fog reset, and storyteller reveal overrides. Walls/doors and sight radius are MVP; lighting and special senses are deferred. Party vision is combined and explored terrain persists dimly.
- Drag previews, W adds waypoints, release commits, Escape cancels, Shift bypasses snapping. R/wheel and a movement-only on-screen selector cycle separate lowest-cost Around, shortest-distance Around, Over, and Through modes. Over uses obstacle heights and movement abilities with ruling/roll prompts; Through explicitly bypasses collision and records the warning/override. Movement review approves no-route and per-segment mode behavior; exact height/traversal rules remain specification work.
- Grid tiles are 5 feet; calibrate image pixels to that world scale. Fractional distances must support 0.1-foot moves; do not infer a 0.1-foot storage quantization. Define rounding/tolerance and square-grid-hidden measurement. Holding Shift bypasses snapping while placing; define snap anchors and scope. Hex support has not been requested.
- Basic shapes, lines, freehand, text, image placement, and separate wall/door and terrain tools are confirmed. Define editing/layers, shape types, and the relationship between visual map elements and mechanical geometry.
- Distinguish grid visibility from whether snapping and grid-based measurement are active.
- Use 2D token footprints and terrain costs along the path; elevation is an editable rules value with no 3D renderer. Define token dimensions, overlapping terrain rules, footprint/path sampling, elevation-based distance/targeting, and flying interactions.
- Walls/solid obstacles block movement with an explicit storyteller override. Define path/token-footprint collision, door states, teleport/flying interactions, and which obstacle types also block sight or spell line of effect.
- Exploration movement has no speed budget; define movement-triggered effects outside combat and explicit time advancement interactions.
- Single-token movement only in MVP. Group movement is deferred.

### Encounter lifecycle, history, and persistence

- All encounter changes are in undo/replay scope. Replay has play/pause, speed, forward/back steps, and seek. Define history lifetime and distinguish gameplay changes from transient interface actions such as selection and camera movement.
- Whole-action undo crosses turns and restores all consequences atomically. Redo is available until a new action replaces the undone future. Define how unfinished prompts/previews are canceled and when an action is considered committed.
- Campaign history is globally chronological across areas. Area histories/replays must be views of this shared record, not independently reversible mutations of persistent party state. Define active-area/display behavior when undo affects a different area and replay context for shared-state changes.
- Replay preserves recorded random outcomes and historical player visibility. Define playback timing and interaction restrictions; camera controls remain available.
- Party state persists across areas; each area retains encounter state; fresh starts copy a prepared template. Define transfer semantics, split-party behavior, inactive-area time, canonical entity ownership, template-edit propagation, and reset handling.
- World/campaign organization, autosave after each completed action, manual save, rolling backups, and full-world export/import are confirmed. Define retention, recovery, archive validation, assets and schema migrations. Rules-content import and standalone campaign portability are deferred.
- One initiative entry per creature, editable rolls/order, storyteller-resolved ties. Zero-HP tokens remain and are skipped/removed from initiative only by storyteller choice. Define round numbering, surprise, mid-round insertion, reorder behavior, and out-of-combat transitions.
- Game time progresses through combat rounds or explicit storyteller advancement outside combat; never through wall-clock waiting. Define turn-start/end triggers, owner/source, inactive-area effects, explicit advance-time increments, and recurring effects during large time advances.
- Define death/unconsciousness mechanical processing and death saves per supported rules while preserving tokens and storyteller-controlled initiative membership. Distinguish deleting library records from removing area placements.

### Two-display operation and interface

- Defaults are public names, conditions, initiative/current turn, movement arrows/templates, and party-only numeric HP. Define visibility overrides, enemy condition disclosure, unknown identity, private rolls, and exact measurements shown.
- Independent map cameras, pan/zoom, focus-one-player and frame-party controls are confirmed. Define input gestures, off-screen/hidden-party handling, viewport preview, and fullscreen behavior. Automatic following is not required by the current decisions.
- Hidden enemies, private rolls/notes, and whether players see movement warnings.
- Displays: 1080p–4K. Typical maps: a few hundred feet; maximum footprint: 5,280 × 5,280 feet. Typical combatants: a few dozen; cap 100 placed entities per running area. Libraries can be larger. No fixed app image-size cap; define adaptive loading and recoverable resource-limit failures.
- Each area preserves running encounter state when switching. Define player-window transition behavior so intermediate loading/private content is never exposed.

## 5. Proposed user workflows to validate

1. Prepare: add images, create entity and spell presets, prepare and save areas.
2. Set up: open an area, place party members, generate enemies with selected variants, and open the player display.
3. Begin combat: roll NPC initiative, enter player initiative, resolve ties, and start the first turn.
4. Run a turn: select an entity, move with distance feedback, choose an attack/spell, resolve supported rolls and effects, then advance the turn.
5. Correct: override a result or undo an action according to the agreed history policy.
6. Pause/resume: save the encounter and reopen with the agreed state intact.
7. Review: finish the encounter and replay its recorded history.

## 6. Sequential implementation roadmap

The detailed [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) now supersedes this coarse sequence. [ARCHITECTURE.md](ARCHITECTURE.md) defines the recommended technical baseline and open behavior boundaries. Current request authorizes architecture planning, not implementation.

This sequence describes dependencies, not a final technical architecture. Each step needs concrete acceptance criteria after discovery. Future agents must read this entire document and the decision record before starting.

| Step | Deliverable | Completion gate |
| --- | --- | --- |
| 0 | Finish requirements, decision record, and SRD automation coverage specification. | All MVP behavior decisions answered; bundled catalog enumerated; per-feature/spell automation requirements approved; explicit exclusions and judgment boundaries recorded. |
| 1 | Choose application packaging, local storage, rendering, and two-window approach. | Short architecture decision with alternatives, offline delivery plan, schema boundaries, and recovery strategy. |
| 2 | Build a minimal two-window application skeleton. | Both displays run offline; player window can be reopened; intended private/public separation demonstrated. |
| 3 | Implement durable world/campaign/entity identities, session histories, content revision tracking and reservation foundation. | Shared canonical records, session-bound undo/conflict checks, finalized histories and recorded outcomes are correct before mutable gameplay is added. |
| 4 | Implement recovery plus outer application shell. | Backup-gated session/restore flows, separate-world import/restore, durable-history coverage and Trash; chooser/Home/World Manager/tabs/settings work offline without private display leaks. |
| 5 | Implement assets, versioned libraries, records/presets/variants, area templates and isolated staging. | Editable/autosaved records, explicit library updates, independent generated entities, resumable setup drafts and atomic Start/cancel work. |
| 6 | Implement map import/drawing, play-area rendering, cameras, grid, tokens, movement, and measurement. | Verified examples cover agreed drawing tools, independent cameras, distance math, budget accumulation, red warning, terrain, obstacles, and undo. |
| 7 | Implement initiative, turns, rounds, conditions, and duration processing. | Agreed examples verify turn ordering, manual initiative, lifecycle transitions, and expiry triggers. |
| 8 | Implement guided creation/leveling/multiclassing and all enabled bundled feature/spell automation, incrementally. | Entire coverage matrix passes: progression, targeting, rolls, saves, damage, effects/resources, triggers, concentration, geometry, judgment prompts and corrections; deferred lighting/senses entries explicitly unavailable. |
| 9 | Complete wall/door/radius visibility, exploration memory, and storyteller controls. | Party sight is combined, explored terrain stays dim, unseen enemies disappear, and private information stays private across updates, area changes, reopening the player window, and history operations. |
| 10 | Implement end-of-encounter replay interface. | Playback reproduces agreed state/visibility and cannot accidentally mutate the live encounter. |
| 11 | Complete remaining management tools and validate/package MVP. | Notes/quests/lore, approved loot/shop generator and settings work; two-monitor encounter, world/session reservations, restart/recovery/import/Trash and offline validation pass. |

Implementation guidelines:

- Establish the history model before building mutable combat behavior that depends on it.
- Implement visibility separation early; finish and verify every visibility rule before release.
- Keep future networking possible without adding accounts or multiplayer to the MVP.
- Validate consequential rules/state behavior with focused tests and agreed encounter examples.
- Visually inspect the practical two-monitor workflow; automated checks alone cannot establish usability.
- Update this plan with completed work, decisions, validation evidence, and remaining limitations at each milestone.

## 7. Decision record

| ID | Decision | Status |
| --- | --- | --- |
| D01 | D&D 5e, 2024 rules. | Confirmed |
| D02 | Single Windows PC; offline; local files. | Confirmed |
| D03 | Storyteller and player views on the same PC; possible player device connections later. | Confirmed |
| D04 | Fully automate every enabled bundled feature/spell; storyteller supplies rulings/choices. Lighting/special-sense-dependent entries are unavailable until later. | Revised by user; explicit exclusion list required |
| D05 | Bundle SRD 5.2.1 character options; manual editors for additional/custom content; imports later. | Confirmed |
| D06 | Automatic visibility using walls/doors and sight radius; defer lighting and special senses. Combine party vision, retain dim explored terrain, hide unseen enemies. | Confirmed |
| D07 | Accumulate movement path during the turn, with waypoints and terrain costs. | Confirmed |
| D08 | Session-owned histories; session-bound whole-action undo crosses turns/areas with external-conflict protection; world/campaign session lists; finalized histories and present-state linked continuation. | Revised/confirmed; gameplay branching deferred |
| D09 | Independent zoomable/pannable cameras; focus one player or frame the party; maps can exceed the viewport. | Confirmed |
| D10 | Imported maps plus basic shapes, lines, freehand, text, image placement, and separate wall/door and terrain tools; adjustable square grid, optional snapping, toggleable grid visibility. | Confirmed |
| D11 | Expanded sheets; SRD 5.2.1 guided creation/leveling for levels 1–20 and multiclassing; point buy/array/app or manual rolls/custom scores; rolled/fixed HP per level; storyteller validation override. | Confirmed; detailed validation/progression specification pending |
| D12 | User-configurable weak/elite modifier profiles for HP, AC, attack/save bonuses, damage, and speed, with per-entity overrides. | Confirmed; arithmetic pending |
| D13 | App rolls or manually entered results; immediately apply outcomes and allow undo. | Confirmed |
| D14 | Attack/save resolution, damage/healing, conditions/stat modifiers, resources, timed areas/terrain, recurring saves/damage, and concentration. | Confirmed automation types; detailed mechanics/content limits pending |
| D15 | Every supported variant number permits a multiplier plus flat adjustment; preview results before generation. | Confirmed; calculation details pending |
| D16 | Area templates suggest affected entities; storyteller can include/exclude targets before resolution. | Confirmed |
| D17 | Walls/solid obstacles block token movement unless explicitly overridden; exceeding speed remains warning-only. | Confirmed |
| D18 | 5-foot tiles; fractional positions/distances supporting 0.1-foot movement; geometric distance including diagonals; Shift bypasses placement snapping. | Confirmed; snap anchors/rounding details pending |
| D19 | Player defaults: map/tokens, public names, conditions, initiative/current turn, movement arrows/templates, numeric HP for party only. | Confirmed; granular disclosure rules pending |
| D20 | Durable history; autosave; backup-gated New Session/Restore; separate-world import/restore; full-world portability; indefinite world/backup Trash, confirmed emptying. | Confirmed; detailed identity/archive contracts pending |
| D21 | Persistent party HP/inventory/resources/effects across areas; areas retain encounter state; fresh starts copy prepared templates. | Confirmed; transfer/reset details pending |
| D22 | Replay play/pause, speed, forward/back step, seek; historical player visibility, unrestricted storyteller inspection, controllable cameras. | Confirmed |
| D23 | Game time advances by combat rounds or explicit storyteller action outside combat; real-world waiting never expires effects. | Confirmed; inactive-area/trigger details pending |
| D24 | Free movement without speed budget outside combat; single-token movement only in MVP. | Confirmed |
| D25 | Typical maps a few hundred feet; maximum footprint 5,280 × 5,280 feet; cap 100 placed entities per running area, larger stored libraries; 1080p–4K; no fixed image-size cap. | Confirmed |
| D26 | 2D map with token footprints and path terrain costs; editable elevation used by rules; no 3D renderer. | Confirmed; elevation interaction details pending |
| D27 | Characters can retain deferred features: label unavailable, require acknowledgment, keep supported features usable. | Confirmed; acknowledgment scope pending |
| D28 | Pause automated resolution at eligible reactions/optional-feature triggers; storyteller chooses or skips. | Confirmed; trigger ordering details pending |
| D29 | Track action economy/resources; warn about invalid use but always allow execution. | Confirmed; resource-underflow behavior pending |
| D30 | One initiative entry per creature; editable rolls/order; storyteller breaks ties; zero-HP tokens remain, storyteller chooses skip/removal from initiative. | Confirmed |
| D31 | Drag preview, W waypoints, release resolves/commits, Escape cancels preview, Shift bypasses snapping; R/wheel/movement-only selector cycle lowest-cost Around → shortest-distance Around → Over → Through. Over uses heights/abilities and prompts; Through explicitly overrides collision. | Movement review approved; user subsequently changed waypoint key from Space to W |

## 8. Concrete acceptance scenarios established so far

These scenarios express confirmed behavior. Exact input gestures and unresolved numeric rules are still subject to discovery.

1. **Movement across multiple drags:** During one turn, move an entity, then move it again. The second preview includes movement already spent. A waypoint path measures its segments rather than just the start-to-end distance. Terrain costs contribute to the total. Exceeding the allowance turns the movement arrow red but does not prevent the drop.
2. **History restoration:** Move an entity, change HP, apply an effect, place terrain, and advance a turn. Undo restores the relevant encounter state in reverse action order. Replay reproduces the changes in forward order and uses recorded roll results rather than rolling again.
3. **Map navigation:** Open an area larger than the player viewport, pan and zoom it, and focus the camera on player entities without moving those entities.
4. **Content authoring:** Create a preset and spell through manual entry, save and reopen them offline, then use them in an encounter. Open guided character creation without importing content and find the agreed bundled options. Content import is not a prerequisite.
5. **Shared vision and exploration:** Two party members reveal different parts of the area. Player view shows their combined sight. When neither can see a previously explored location, its terrain remains dim but enemies there disappear. A closed door blocks sight; opening it updates visibility. Lighting and special senses are outside this MVP scenario.
6. **Independent cameras:** Pan/zoom the storyteller view without changing the player view. Focus a chosen player on the player display, then frame the party. Neither operation moves tokens.
7. **Variant independence:** Generate two enemies from one preset using different modifier profiles. Override one entity's values without changing the other entity or source preset.
8. **Immediate combat resolution:** Resolve a supported attack using app dice, then another using manual results. Outcomes apply without a separate approval step. Undo restores pre-action HP, resources, effects, and other encounter changes together as one action.
9. **Undo across turns and redo:** Resolve an action and advance the turn. Undo the turn advance, then the action; redo restores the same outcomes without rerolling. Undo again and commit a different action: the previous redo future is replaced.
10. **Judgment-dependent automation:** Invoke an enabled bundled feature requiring an adjudication. The app asks for the needed ruling/choices, then applies the defined rolls, resource costs, effects, durations, and state changes. It does not delegate mechanical bookkeeping back to the storyteller.
11. **Player HP privacy:** Party HP numbers are visible on the player display; enemy HP numbers are not. Both are available to the storyteller. Other enemy disclosure details remain to be specified.
12. **Area continuity:** Change a party member's HP/resources in area A, move to B, and verify those values carry over. Return to A and verify its prior encounter state is retained. A fresh encounter uses a new copy of its prepared template; exact party reset choices remain pending.
13. **Portable world:** Export a world with its campaigns, shared records, required assets and session histories; import into a clean local installation. Shared identities, characters, areas, current state and replay remain usable offline. Standalone campaign portability is deferred.
14. **Replay isolation and privacy:** Seek backward, change replay speed, and step through a saved encounter. Player view uses visibility from the replayed moment, while storyteller inspection can reveal all recorded entities. Leaving replay restores live state unchanged.
15. **Deferred mechanics disclosure:** A feature/spell on the agreed lighting/senses exclusion list is clearly labeled unavailable and cannot be executed as if fully supported. Creation/leveling remains allowed for a character receiving such a feature, requires acknowledgment, and keeps supported features usable.
16. **Fractional placement:** With snapping enabled, hold Shift and place/move a token at a fractional-foot position, including a 0.1-foot displacement. Release Shift to restore snapping. Hiding the grid does not change world scale.
17. **Cross-area undo:** Inside one session, act in area A, transfer to B, then act again. Undo follows that session's reverse action order, atomically restoring party/area consequences without crossing session start or overwriting newer external changes.
18. **Game time versus waiting:** Leave the application idle and verify no game-time duration expires. Advance game time explicitly outside combat and verify applicable effects update. Undo restores the time change and its consequences together.
19. **Creation methods:** Create characters using each supported ability-score method and advance levels using both rolled and fixed HP. Validate derived values and confirm storyteller overrides preserve the entered choices rather than silently reverting them.
20. **Area capacity:** Place 100 entities in one running area. Reject placement of a 101st without altering saved state; additional stored library entities and placements in other areas remain allowed. Boundary behavior for generated/summoned creatures must follow the final capacity policy.
21. **Optional trigger interruption:** Resolve an action with an eligible reaction or optional feature. Pause at its trigger, offer choices/skip, then resume with the chosen consequences. Undo the completed originating action and its linked consequences as a whole; grouping details for multi-entity movement reactions remain to be specified.
22. **Warning-only action economy:** Attempt an action with insufficient tracked action/resource allowance. Display the warning and permit execution; do not silently reset spent resources or allowances. Exact resource-underflow representation remains pending.
23. **Initiative and zero HP:** Edit tied initiative results/order, reduce a creature to zero HP, and verify its token stays in place. The storyteller can skip or remove its initiative entry without deleting the token or entity record.
24. **Movement routing modes:** Drag behind an obstacle with a shorter difficult-terrain path and a longer clear path. The lowest-cost and shortest-distance Around modes can choose different routes and always display actual movement cost. Over considers obstacle heights and movement abilities, prompting for required choices/rolls. Through visibly overrides collision and records it. R/wheel/selector change modes; W fixes a waypoint; Escape cancels uncommitted movement; release resolves/commits the route. Interrupted-movement behavior follows the approved movement review.

## 9. Source notes and proposed content boundary

- Official SRD landing page: https://www.dndbeyond.com/srd
- Official creator FAQ: https://www.dndbeyond.com/creator-faq
- Official SRD 5.2.1 PDF: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
- Checked during planning on October 21, 2026: Wizards lists SRD 5.2.1 as available under CC BY 4.0. The creator FAQ distinguishes SRD content from the broader Basic Rules and rulebooks.
- Approved: bundle character options from SRD 5.2.1 with its required attribution and use manual editors for other options. This does not include every option from the full rulebooks.
- Implementation must pin the selected content version, enumerate its actual catalog, and distinguish enabled automated content from explicitly unavailable lighting/senses content.

## 10. Required automation specification work

The MVP now includes a broad rules engine. A short list of generic combat primitives is insufficient evidence of completion.

Before rules implementation, produce a versioned SRD content inventory and coverage matrix with one entry per bundled feature/spell. Mark each entry enabled or deferred due to lighting/senses dependencies. For each enabled entry record its source location, character-creation/progression implications, inputs, storyteller rulings, targets, roll rules, resource changes, persistent/recurring state, expiry/removal, interactions, undo behavior, and acceptance examples. For deferred entries record the reason, dependency, user-visible unavailability, and creation/leveling implications.

Use incremental playable milestones, but do not label a partial automation milestone the completed MVP. Release requires every enabled entry to meet the agreed automation definition and every deferred entry to be explicitly identified and unavailable. Do not use the exclusion policy to silently defer unrelated difficult mechanics.

## 11. Consolidated detail review

See [PROPOSED_DETAILS.md](PROPOSED_DETAILS.md). Movement/geometry section 1 was approved on October 22, 2026, following the ten-item chat review. Sections 2–7 remain unapproved proposals. These documents do not replace the SRD coverage matrix or final architecture.

Graphical design discovery is now tracked in [GRAPHICAL_DESIGN.md](GRAPHICAL_DESIGN.md). The user's request to review graphical design does not approve unrelated behavior proposals or authorize app implementation.

Outer application/launch navigation discovery is tracked in [APP_NAVIGATION.md](APP_NAVIGATION.md). As of October 26, 2026, this is the active design topic; map visual drafting is paused, not canceled. Define launch/campaign/preparation/settings systems before finalizing the complete screen plan.

Confirmed outer-app scope: reopen last campaign home with campaign switcher; home prioritizes Resume Last Session, party summary, prepared areas, recent activity, and preparation navigation. Global reusable library feeds versioned campaign copies; library edits never silently update games. MVP additionally includes session notes, quest tracking, world/location lore, and loot/shop management alongside campaign/content/party/history/backup/settings systems. Exact workflows are in APP_NAVIGATION.md discovery.

Outer navigation refinement: Home is the hub; tools and Play open as closable workspace tabs. Reopen the separate player window at launch if previously open and retain its last public map while storyteller prepares. Quests/lore are lightweight notes/tags/links plus quest status, with advanced structures deferred. Loot/shop quick-generation uses tiered percentage loot tables: choose shop tier and total, edit the generated draft, then finalize; exact generation semantics are pending.

Loot/shop refinements: total is a currency-value stock budget; roll each entry independently; selected tier includes lower tiers with configurable tier weights. Finalize editable stock to a persistent individual shop; stock never rerolls on open. Purchases/transfers remain manual inventory/currency edits in MVP. Exact tier weighting and generation termination rules remain pending in APP_NAVIGATION.md.

Generator refinements: each pass independently rolls eligible entries using base chance × tier multiplier capped at 100%; each success adds one affordable unit and halves that entry's subsequent chance. Stop at target 70% spend or 10 passes by default; both configurable. Manual draft edits can exceed budget with a warning and can still finalize. Exact duplicate/cap calculation order and pass processing are under review in APP_NAVIGATION.md.

Latest approved navigation/editor behavior supersedes earlier Home-first launch wording: restore all tabs and focus last-used tab. Home stays the hub. Preparation editors autosave as typed with version history/undo; this does not automatically apply changed definitions to live encounters. Sessions are named/dated notes plus start/end history markers; Resume uses canonical campaign state and session end never resets it. Shop algorithm is now approved: clamp base × tier chance to 100%, divide by 2^successful additions for that entry/draft; shuffle each pass, reset reductions on new generation, test target after each affordable single-unit addition, and stop at target/pass cap/no affordable possible entries.

Campaign flow: no previous/accessible campaign opens chooser with recents/New/Open Folder/Import and Locate/Remove for missing paths. New Campaign asks name/local folder, optional description/image; SRD defaults, then empty Home. Campaign switching leaves the previous public map until explicit new-map send. Global updates show Update Available and a differences/dependencies preview before explicit campaign-definition update; existing generated entities/live areas remain unchanged until explicitly edited/regenerated.

Publication/list refinements: after campaign switch the old public map is frozen, allows player pan/zoom, and sends no selection/hover to storyteller; explicit Send activates the new campaign map. Opening/resuming areas within the same campaign updates players immediately; template-editor exception is pending. Management uses searchable tables/lists with tags/filters and preview/details, plus thumbnail-grid options for Images/Areas. Opening a record focuses its existing tab; different records can have separate tabs; one Play tab per campaign.

Latest publication revision supersedes automatic same-campaign map updates above: selecting a new map freezes player view with Selecting new map; storyteller chooses/prepares the map and camera, then presses Start to publish/resume. Home uses a small labeled tool-button grid with Resume/party/areas/activity below. Notes/quests/lore use simple rich text, headings/lists/images/tags/record links and quest status. Closing Play or ending a session leaves the public area visible; session end only adds its marker, never resets state or advances game time.

Map staging is confirmed: autosave isolated placement/enemy/terrain/party changes, preserve draft across restart, commit together on Start. Publish an explicit player-camera preview independently positioned from storyteller camera. Cancel returns/unfreezes previous live map and offers Keep Draft or discard after confirmation. See APP_NAVIGATION.md section 7 for the transition contract and acceptance checks.

Home navigation is approved as enumerated in APP_NAVIGATION.md section 8 (eleven tool buttons and six Library categories). MVP has one party; multiple parties are deferred. Sessions can be marked Complete and later reopened/continued; multiple active sessions are permitted, with action-to-session assignment still to be specified. Opening a different session must not automatically complete the old one or create a separate party-state timeline.

Confirmed graphical foundation: initiative left, map center, active creature/actions right; library/history open on demand. Follow Windows light/dark mode. Inspect other creatures in a movable floating panel that remembers its position. Offer separate Comfortable and Dense modes. Use square portrait tokens matching creature footprints, with initials fallback. Exact dimensions and visual states remain in graphical discovery.

Further graphical decisions: allow multiple pinned inspectors plus one selection-following inspector; selected exact HP appears in inspectors, with a compact party-only HP panel in player view, never on token labels. The active creature panel is one scrollable sheet with collapsible Stats, Actions, Spells, Inventory, and Effects sections.

Map/player layout: player initiative is a collapsible vertical list on the left. Bare Alt release toggles storyteller overlay detail, ignoring chords/text entry. Low-detail makes mechanical geometry transparent and hides ALL map numbers (including distances/target numbers/scale labels), while panel values remain visible. Player view hides wall editing geometry and shows public doors/terrain effects within fog rules. Grid lines are uniform and neutral, auto-hidden when too dense; scale bar stays drawn, with numeric label suppressed in low-detail mode. Draft opacities are tracked in GRAPHICAL_DESIGN.md pending visual approval.

Inspector refinement: hover shows a separate read-only preview near the pointer, or emphasizes an existing inspector for that creature. Click retains full editable inspection; pins also expose full editable collapsible sheets. Space toggles the hovered creature's own pin, superseding earlier LIFO undo wording. Q closes oldest, Alt+Q closes all, Shift+Q restores the last closure/batch. Pin numbers remain stable while campaign is open; ordinary reopening creates a new newest pin/number; collapsible recents includes closed pins. Player hover mirrors to storyteller only, matching one-way click selection. Shortcuts ignore text entry and held-key repeats. Add Waypoint is W. Hover summary includes name/portrait, current/max/temp HP, AC, speed, conditions/timers, and action/resource availability, filtered to public information in player view. Active-sheet sections initially open and remember expansion/scroll per creature; only name/current turn and Next Turn stay fixed. Player party-HP panel is movable with remembered position and Close.
