# Proposed behavior details — awaiting review

History revision: WORLDS_AND_SESSIONS.md supersedes flat campaign-action-history proposals in this document. Sessions now own histories; branching is deferred. Movement approval does not override later user revisions to history ownership or waypoint binding.

Status: movement and geometry (section 1) approved by the user on October 22, 2026, following the ten-item movement review in chat. Sections 2–7 remain proposals. Read alongside PROJECT_PLAN.md. Confirmed user decisions take precedence. Approval of product behavior does not authorize implementation start or select a technical stack.

## 1. Movement and geometry

Approved scope: the ten-item movement review, including the four-mode cycle, path optimization, segment modes, preview/cancellation, displays/precision, snapping, Over/Through behavior, interrupted movement, door/elevation treatment, and overlapping terrain. Algorithm selection and exact rules formulas remain specification work; do not substitute invented rules.

- Cycle in this order: Around—lowest movement cost, Around—shortest physical distance, Over, Through. R cycles forward. Each wheel notch cycles one mode; wheel input does not zoom during token movement. The four-choice selector appears only while moving.
- Default to Around—lowest movement cost for each new drag. Show mode, geometric distance, terrain-adjusted cost, movement already spent, and remaining allowance in the storyteller preview. Player view shows the route/distance and red speed warning, without private ability/roll information.
- Both Around modes route through user waypoints in order. Lowest-cost mode minimizes travel cost; shortest-distance mode minimizes geometric path length but still charges terrain costs. Use token footprint clearance, not just a center-point ray. No path means a blocked preview; no silent fallback to Through.
- Each waypoint fixes a segment's mode. Cycling changes only the unfinished segment. Escape cancels an uncommitted drag. Shift disables snapping; it does not bypass collision.
- Add a waypoint with W during movement. This later user decision replaces the original Space binding; Space is reserved for inspector pin/unpin behavior.
- Snap token footprints to the square-grid lattice with size-aware anchors; token position represents its center. Wall vertices and drawing handles snap to grid intersections. Permit numeric position/elevation entry for precise placement. Hiding the grid does not change snapping.
- Store fractional world coordinates in feet. Show distances to 0.1 foot by default; use unrounded values for path cost and speed comparisons, with a documented small numeric tolerance. Camera zoom and display scaling never change world distances.
- Closed doors block sight and ground movement; open doors do neither. Mechanical wall/obstacle geometry is separate from decorative images/drawings. Mark movement blocking and sight blocking separately.
- Obstacle/wall height is editable; an unspecified height prevents automatic Over resolution until a height or ruling is supplied. Over asks for climb/jump/fly when more than one valid traversal exists. It computes the selected route and movement costs from the enabled rules and numeric heights, with prompts for missing information or checks. Do not invent a universal jump/climb formula.
- Retain 2D rendering. Ground routes follow the map plane; explicit ascents/descents contribute to traversal cost. Range checks use horizontal separation and elevation difference when relevant. Sight remains wall/radius-based; any elevation-dependent visibility ambiguity needs a storyteller ruling rather than an implied 3D visibility engine.
- Through bypasses collision only. Terrain costs, travel distance, reactions, and movement-triggered effects still apply. Track the path as physical movement unless an actual teleport feature is used.
- At release, resolve movement in path order. Pause at reaction/effect/check triggers. Already resolved movement remains if a later segment becomes impossible; unused remainder is canceled or revised. Undo restores the completed movement action and linked consequences. Escape during preview is different from stopping an already resolving move.
- Ordinary difficult terrain does not multiply repeatedly merely because regions overlap. Explicit custom costs must define additive/multiplicative behavior and precedence in their editor; do not guess from region order. Split paths at relevant terrain boundaries.

## 2. Rules, rolls, and correction

- Use the pinned SRD 5.2.1 rules for enabled mechanics. Document home-rule departures explicitly: geometric measurement, permissive action/resource execution, and storyteller overrides.
- Manual entry accepts raw die results or a final total via explicitly labeled modes. Raw results allow automatic critical/advantage processing; final totals require any missing natural-roll/critical decision from the storyteller. Record which inputs were supplied.
- Treat a completed attack/spell and its resource use, reactions, target outcomes, geometry, and effects as one undoable action. Reaction decisions occur before dependent outcomes are finalized. Do not reroll on redo or replay.
- Track invalid resource use as an explicit overspend record while the remaining usable resource stays at zero. Show amount owed/overspent; do not silently create resources or display a plausible legal balance. Unlimited-use features have no artificial counter.
- If simultaneous triggers have no unambiguous ordering, prompt the storyteller for order. Process nested reactions in an explicit resolution stack. Never auto-select an optional expenditure.
- Bundled conditions and defenses follow the selected rules. Custom conditions can include a label, icon, notes, duration, and supported structured modifiers; unsupported behavior is visibly manual. Built-in engine coverage does not imply arbitrary executable user scripts.
- Zero HP runs applicable enabled mechanics, including death-save/concentration behavior, while keeping the token present. Initiative removal remains a storyteller decision.

## 3. Presets and variants

- Numeric profile transformation is base × multiplier + flat adjustment, then field-specific rounding/clamping, followed by any explicit per-entity override. Standard is identity (×1 +0).
- Round integer stats down; HP maximum is at least 1. Speeds remain fractional and at least zero. Validate invalid/nonfinite values before saving. Display every change in the generation preview.
- Damage modifiers transform each rolled damage component's numeric amount rather than silently changing dice counts or die sizes. Apply before target defenses. Criticals change underlying dice according to the rules before the profile transformation. Define a separate save-DC modifier instead of assuming a saving-throw bonus changes spell DC.
- Generated entities are independent snapshots of their preset/profile versions. Later edits do not retroactively change them; explicitly regenerate or edit an entity to apply new values. Manual overrides are visible and removable.
- Batch generation assigns distinct entity IDs/names and checks area capacity before committing. At capacity, summon/spawn actions prompt for a valid placement/removal choice before spending resources; never silently omit creatures.

## 4. Time, areas, and history

- Confirmed: independent campaign clocks, shared world mutations in action order, no date synchronization. Proposed details: combat advances that campaign clock by one round's rules-defined duration at the round boundary; Advance Time accepts seconds/minutes/hours/days. Opening/closing areas and real waiting add no time. Shared effect timer ownership remains unresolved.
- Expiring elapsed-time effects update across all areas when campaign time advances. Turn-relative triggers use their associated encounter/owner. Inactive encounters do not invent turns; if a transfer leaves turn-based effects unresolved, prompt for how combat ends/continues before transfer. Only one encounter advances initiative at a time.
- Large time advances resolve scheduled consequences in chronological order. Stop for required rolls/rulings; do not silently skip recurring damage. The time advance and its linked consequences form one undoable action.
- Start combat at round 1. Reordering existing initiative does not reset spent actions. Mid-round additions receive an explicit storyteller-selected insertion/start policy rather than accidentally gaining a turn. End Combat retains surviving effects/resources and requires any unresolved timing choices.
- Transfer party members, not duplicate their canonical entity state. Split parties may occupy different areas, but only the selected player area is shown. Resetting an area replaces its encounter instance; keep party state unless explicitly reset through a separate operation. Template edits affect future instances only.
- Undo of a different-area action opens the affected context on the storyteller display. Keep the player view covered until the resulting public state is ready. Selection, hover, camera motion, and replay controls are not gameplay history events; content edits and visibility changes that affect play are recorded.
- Retain chronological history until an explicit campaign/archive deletion. Replay can select a session/encounter range while including the state needed to reconstruct it. Historical outcomes and visibility use historical content/assets; definition edits must not rewrite old replays.

## 5. Privacy and controls

- Manually hidden entities never appear on the player map, initiative list, camera framing, target highlights, or replay until historically revealed. Never leak a hidden entity through a label, arrow, reaction notification, or marker.
- Public enemy names can be aliases separate from private identities. Enemy HP, exact stat blocks, inventory, private notes, and roll details stay private. Public conditions are individually hideable; defaults show conditions on visible entities.
- Shared sight comes from party members in the displayed area, with per-entity sight participation/radius controls. Show unexplored terrain opaque and explored-but-unseen terrain dim; do not reveal current unseen enemy positions. Allow explicit reveal/hide/fog-reset controls, recorded in history.
- Player camera focus/framing uses visible eligible party members in the displayed area only. Provide a player-viewport rectangle/preview on the storyteller map, independent camera controls, and a blank-player-screen button. Reopening a player window begins covered until public state is ready.
- Mouse wheel zooms around the cursor outside movement; middle-button drag pans. Provide visible alternatives for pan/zoom and numeric camera controls. Player window supports fullscreen and choosing its monitor.
- Practical layout: area/entity library at left, map in the center, selected entity/actions at right, initiative strip and event log accessible without covering the map. Panels resize/collapse. Dense readable controls, neutral surfaces, no decorative transitions; color supplements labels rather than replacing them. Review a screen layout before building the interface.

## 6. Character creation, saves, and delivery

- Wizard validates the enabled rules, preserves choices by level, shows derived changes before completion, and permits explicit storyteller overrides. Record overrides in character history. Respec occurs through an explicit rebuild preview; applying it is a single history action, not silent stat replacement.
- Acknowledge a deferred feature when first granted or when its availability changes; retain that acknowledgment per character and feature/version. Keep its description visible with an Unavailable label and no executable action. Do not require acknowledgment on every sheet opening.
- Inventory includes quantities, weight, equipped/attuned state where applicable, and supported consumable/resource actions. Mechanical item effects use structured supported definitions; free-text descriptions do not automatically become executable rules.
- Confirmed: full-world export/import only in MVP; standalone campaign portability deferred. Proposed archive contents: campaigns, shared definitions/entities, current state, session histories and required images, with a manifest/version. Import identity/overwrite policy remains pending; external-rules-content importing stays deferred.
- Autosave uses an atomic durable transaction for each completed gameplay action; keep last-known-good state after interrupted writes. Show unsaved/save-failure status and permit recovery/export without claiming success. Interrupted resolution restores the last completed action rather than rerolling partially applied outcomes.
- Superseded backup proposal: fixed 20-point/7-day rolling retention was not approved. Follow DATA_AND_RECOVERY.md: history-based world restoration, backup before restoration and new session start, world Trash and separate-world imports. Any migration backup/unsupported-format behavior remains a proposal unless separately approved.
- Large images retain originals and use cached reduced/tiled representations as needed. Import supports PNG, JPEG, and WebP initially. Never allocate a full square-mile map as one giant bitmap. Resource failures produce a recoverable message; do not silently destroy/replace originals.
- Validate Windows 1080p–4K layouts, mixed monitor scaling, 100 placed entities, maximum map extent, restart/resume, interrupted saves, export/import, history privacy, and long-running encounters. Select representative hardware and measurable interaction targets during architecture planning rather than inventing a universal performance guarantee.

## 7. Remaining specification deliverables after behavior review

1. Enumerated SRD catalog, exclusions, dependency policy, and per-entry automation/acceptance matrix.
2. Exact data schemas, effect/trigger ordering, geometry algorithms, and save-format contract derived from approved behavior.
3. Screen-layout review and architecture decision, with an offline packaging plan.
4. Implementation tasks split into small dependency-ordered units with acceptance checks and handoff notes. Move durable history/persistence ahead of live mutable gameplay and advanced wizard mechanics.

No implementation should rely on an unresolved proposal as if it were a confirmed requirement.
