# Graphical design specification

Status: discovery. Foundational layout and appearance behavior are confirmed below; exact dimensions, components, and screen drafts remain under review. This document will become the interface contract for a future implementation agent.

**Visual baseline accepted, October 27, 2026:** the user accepts the current A05 preview as a good baseline and its minimal color scheme. Preserve that direction and the approved bottom inspector/top player queue/header HP changes. Continue with non-graphical contract work; this does not approve unreviewed functional fields or replace later accessibility/scaling/runtime validation. Older provisional visual notes below must be read against this latest baseline acceptance.

A05 baseline: UI_EDITOR_CONTRACT.md sections 3–5 and the saved preview record the reviewed shell, Play, player window and inspector. Use the approved layout and interaction decisions there. Native scaling, accessibility and detailed presentation combinations are validated during implementation. A01's selected rules/preset/ownership approvals also apply; the old movement-only approval boundary in section 5 is historical, not a reversal of A01.

**Latest direct user revision — October 27, 2026:** keep the Play/Home/manager/editor arrangement, but place retained/pinned inspection in a bottom dock like a Blender panel, visible without scrolling the workspace. This supersedes floating inspector placement and the older rejection of a bottom panel below. Hover remains a distinct read-only transient preview; active-turn sheet remains distinct. Exact dock height, multiple-pin presentation and internal long-content handling are under review in UI_EDITOR_CONTRACT.md. Editors save only on leaving a field or pressing Enter, not after a typing pause.

Follow-up approval: long inspector content may scroll inside the fixed dock while header/workspace stay fixed. Multiline Enter is newline; Ctrl+Enter or field departure commits. Exact dock heights and multi-pin tab details remain proposed.

Dock design approved in the next review: full-width bottom dock with creature/pin tabs and Stats/Actions/Spells/Inventory/Effects tabs; default 230 logical pixels high, resizable 180–420; fixed header and scrolling content. This supersedes pending height/tab wording above. Remaining hover/pin-number/appearance details are still under review.

Latest player revision, now clarified: initiative is a horizontally scrollable turn queue at the top with an arrow tab below, collapsing upward/reopening downward. It replaces the old player left-list design; storyteller initiative is unchanged. Unknown visible identities display `unknown`, including public labels/accessibility; private initials/names are not fallbacks, and hidden entities remain absent. HP is beside names in creature-sheet and inspector headers, not initiative entries; enemy HP stays private.

## 1. Confirmed design constraints

- Lightweight, practical information display for running a tabletop game.
- No decorative transitions, ornate fantasy styling, elaborate themes, or visual ornament for its own sake.
- Storyteller control window and separate player window on the same Windows PC.
- Independent cameras, with focus-player and frame-party controls.
- Support 1080p–4K monitors, including display scaling. Game-world scale is independent of UI pixels.
- Storyteller sees private stats; player defaults show map/tokens, public names, conditions, initiative/current turn, movement arrows/templates, and party-only numeric HP.
- Map pan/zoom, grid visibility, fog/visibility, and movement feedback need legible representations.
- Movement controls follow approved PROPOSED_DETAILS.md section 1. The mode selector is visible only during movement.
- Color must not be the sole way to distinguish warnings, selection, or current turn. The required red movement warning also needs a textual/numeric indication.

## 2. Review sequence

| Order | Review | Specification produced |
| --- | --- | --- |
| 1 | Main storyteller layout, density, neutral palette, selected versus active creature | Panel arrangement, information hierarchy, typography baseline |
| 2 | Map and tokens | Token shape/images, name/HP/condition placement, selection/current-turn markers, grids, terrain/wall/door styles, fog, movement overlays |
| 3 | Entity and combat panels | Exact summary fields, tabs, action rows, resource controls, targeting/results/reaction prompts |
| 4 | Player display | Overlay positions/sizing, initiative list, party HP, private/public transitions, fullscreen and camera controls |
| 5 | Preparation tools | Campaign/library navigation, area editor, asset/entity/preset editors, generation, character wizard |
| 6 | History and persistence states | Log/replay layout, undo feedback, save/recovery/error states, empty/loading/disabled states |
| 7 | Final screen specification | Reviewed wireframes, dimensions, scaling, keyboard/focus states, reusable components, interaction/state checklist |

## 3. Foundation decisions awaiting answers

| ID | Decision | Status |
| --- | --- | --- |
| G01 | Initiative left, map center, active creature/actions right; library and history open on demand; panels resizable/collapsible | Confirmed |
| G02 | Separate Comfortable and Dense display modes | Confirmed; exact typography, spacing, scope, and scale controls pending |
| G03 | Follow Windows light/dark mode; specify both | Confirmed behavior; exact color values pending |
| G04 | Hover read-only; clicked/pinned sheets fully editable. Space toggles the hovered creature's pin; Q closes oldest, Alt+Q closes all, Shift+Q restores last closure/batch. Stable numbers during open campaign; reopen gets new newest number; recent list includes closed pins | Confirmed; geometry, restore-number details and restart persistence pending |
| G05 | Square portrait crops matching creature grid footprints; initials fallback | Confirmed; overlays, framing, and footprint sizing details pending |
| G06 | Always show eligible tokens/names; hover dims others/raises hovered token; repeated clicks cycle overlaps. Player hover mirrors to storyteller, never the reverse | Confirmed; opacity and concurrent-pointer precedence pending; visibility rules still apply |
| G07 | Thick square health border, unchanged portrait: blue full, green 75%+, yellow 50%+, orange 25%+, red below 25% while above zero; zero HP and dead share theme-dependent black/white outline; zero HP without death stays opaque, confirmed dead becomes translucent | Confirmed; exact palette/theme mapping pending |
| G08 | Selected HP only in creature inspector, not token labels; player party selection opens movable remembered-position panel with name/current/max/temp HP and Close. Player selection updates storyteller selection; reverse does not | Confirmed; panel persistence scope/off-screen recovery pending |
| G09 | Small condition icons along top edge, overflow count; hover reveals names/timers | Confirmed; icon limit/sizing and disclosure details pending |
| G10 | Active turn: solid outer frame + TURN; inspection: dashed corner brackets; targets: numbered corner badges; red movement path + Over speed label | Confirmed; geometry, precedence, and simultaneous-state spacing pending |
| G11 | Click-through stack selection: repeated clicks at the same overlap select the next eligible entity and wrap; initial storage order is acceptable | Confirmed; click/drag threshold and cycle-reset behavior pending |
| G12 | Active creature panel: scrollable collapsible Stats, Actions, Spells, Inventory, Effects; all initially open, remember expansion/scroll per creature; only name/current turn and Next Turn stay fixed, stats scroll | Confirmed; exact section contents and scroll handling after edits pending |
| G13 | Player initiative is a horizontally scrollable turn queue with projecting arrow tab for vertical collapse/reopen | Latest user revision; replaces left list. Anchor/remaining details under review |
| G14 | Bare Alt release in focused storyteller window toggles detail; ignore Alt chords/text entry. Low-detail keeps mechanical geometry translucent and hides ALL map numbers, including distances/target numbers; panel values remain visible | Confirmed; draft opacity values awaiting visual review |
| G15 | Player fog: unexplored opaque; explored unseen terrain dim; hide wall-editing geometry, show public doors and terrain effects | Confirmed; exact fills/opacities and public-overlay visibility rules pending |
| G16 | Grid uses uniform thin neutral lines without major lines; hide when too dense at distant zoom; scale bar remains visible | Confirmed; zoom threshold, line contrast, and scale-bar layout pending |

### Initial wireframe under review

- Placement revision history: an earlier review selected floating inspectors; the latest October 27 A05 instruction replaces that with a bottom dock. Keep the three-column arrangement above it; use the current revised preview rather than the old floating or stacked designs.
- Draft examples are illustrative encounter data, not approved sheet schemas, token styling, or combat rules.
- Initiative/entity selection changes only the secondary inspector; it does not advance the turn or replace the active-creature panel.
- Current turn and inspected selection require distinct simultaneous markers. Map room/token styling and panel sizes are provisional.
- Draft uses local preview interactions for inspection, library/history disclosure, grid visibility, and covering the player screen. It does not implement game mechanics. Disabled controls indicate layout placeholders, not unavailable MVP features.
- First draft compared mixed density with comfortable spacing. This is superseded by separate Comfortable and Dense modes. Exact 1080p/4K scaling remains to be reviewed at logical pixel sizes; an inline preview is not a full-resolution monitor test.

### Confirmed direction after first draft

- Inspection lifetimes: retained/pinned inspection now lives in the bottom dock under the latest A05 revision. Hover opens a separate read-only preview near the pointer and disappears on unhover; it never closes retained/pinned inspection. Hovering an already inspected creature emphasizes its existing dock content. Single click retains inspection until another entity is clicked. Space toggles that creature's pin. Q closes the oldest pin (FIFO), Alt+Q closes all, Shift+Q restores the last closure/batch. Use the approved dock tabs in UI_EDITOR_CONTRACT.md. Validate remaining pin presentation and restart behavior during implementation. Private full inspection never appears in the player window.
- Comfortable and Dense are explicit display modes, not a single mixed typography treatment. Define and review both before implementation.
- Tokens use square portrait crops sized to their creature footprints, with initials when no portrait is assigned. Circular token rendering in the first draft is superseded. Token overlays and simultaneous state markers are the next design review.

### Token display decisions

- Two views means two separate application windows, not two tabs or panes in one window. The player window contains only the public projection of encounter state.
- Always-visible token names apply only to entities that the viewer is allowed to see. This does not reveal hidden enemies or entities outside player vision; storyteller can inspect private state.
- Hover raises the hovered entity temporarily above a stack and makes other tokens translucent. Preserve underlying encounter state and saved placement/stack order. Player-window hover mirrors to storyteller; storyteller hover never mirrors to players. This is presentation state, not encounter history. Mirroring must not expose storyteller-only data in the player window. Pointer placement for mirrored previews and concurrent-pointer precedence remain to be specified.
- Click-through stack selection: hit-test all eligible entities at the clicked map location. First click selects the first in available storage order; subsequent clicks at the same overlap select the next and wrap. No special sort order is required. Temporary hover/selection raising must not prevent reaching underlying candidates or reorder the cycle. Player hit-tests exclude hidden/unrevealed entities. Exact cycle reset and drag-start behavior remain to be specified; do not add a stack picker or Alt-wheel requirement.
- Selection synchronization is one-way: selecting an entity in the player window also selects/inspects it in the storyteller window. Selecting in the storyteller window does not change the player window's selection/highlight/selected-HP display. This does not change the active initiative turn or synchronize cameras. Maintain separate selection state per window rather than one globally mirrored selection. Storyteller selection may therefore differ from the player selection until the next player-side selection.
- HP ratio categories: full = current HP at maximum; green = 75% to below full; yellow = 50% to below 75%; orange = 25% to below 50%; red = above zero but below 25%. Zero HP and confirmed death override those ratio colors with the same theme-dependent black/white outline. Color is public even for enemies; exact enemy HP remains private. HP above maximum and temp HP require explicit rules.
- Zero HP without confirmed death remains fully opaque. Confirmed dead creatures become translucent. The black/white outline is the same for both states; proposed theme mapping is black in light mode, white in dark mode, pending confirmation. Hover dimming is a separate temporary emphasis effect, not a death-state indicator.
- Health color appears as a thick square border, with the portrait unchanged. No HP bars have been approved. Selected HP is shown only in the creature inspector, not in token labels/popovers. In player view, selection of a party member opens a compact party-only HP panel; enemy selections never show exact HP. Existing active-creature HP/stat controls remain valid; this decision removes selected-HP overlays around tokens rather than removing stats from creature sheets.
- Conditions occupy the token's top edge with an overflow count; hover exposes names and remaining timers. Full data remains accessible in creature panels. Private-condition disclosure remains under review.
- Keep active-turn frame/TURN label, dashed inspected-corner brackets, and numbered target badges distinguishable when combined with health color and condition icons. Their spatial arrangement must be shown in the next token draft.

### Active creature sheet

- Main right panel follows the active initiative creature, not arbitrary inspected selection.
- Use one scrollable sheet with collapsible sections: Stats, Actions, Spells, Inventory, Effects. This supersedes tabs and separate action/spell-list proposals.
- Keep only name/current turn and Next Turn fixed while the sheet scrolls. All stats scroll with their sections. Initially expand all sections; remember expansion and scroll per creature. Exact field layout, row actions, editing, and targeting/reaction prompts remain to be reviewed.
- Pinned and click-retained inspectors expose the full editable collapsible sheet. Hover previews are read-only. The main active-creature sheet remains distinct and is not replaced by inspection. Exact hover summary fields are awaiting review.

### Inspector lifecycle and unresolved input conflicts

- A hover preview, retained single-click inspection, and pinned inspection are separate lifetimes. Do not treat leaving a token as permission to close pinned/retained inspectors.
- Pin numbers stay stable while the campaign is open; gaps after closing are allowed. Reopening a closed creature from recents creates a new newest pin and number. Recent list includes closed pins. Shift+Q restoration versus ordinary reopening must be distinguished; exact restored-number policy and restart persistence remain to be specified.
- Repeated clicks cycle stacked entities. Double click no longer pins. Space toggles the hovered creature's own pin: with A then B pinned, hovering A and pressing Space removes A, not B. Repeating on that creature toggles it again. Add Waypoint is W. Do not reintroduce double-click delays for pinning.
- Q closes the oldest open pin (FIFO); Alt+Q closes all pins; Shift+Q restores the last inspector closure, including Close All as a batch. These are interface actions, distinct from campaign undo. Inspector shortcuts ignore text-entry fields and held-key repeat events.
- Approved hover summary: name, portrait, current/max/temp HP, AC, speed, conditions/timers, action/resource availability. Player hover includes public information only, never exact enemy HP/private stats. Full editable sheets remain restricted to storyteller inspectors.
- The compact player party-HP panel is movable, remembers position, contains name/current/max/temp HP and Close, and does not expose enemy exact HP.

## 4. Required handoff detail

### Map overlays and player-window layout

- Player initiative is a horizontally scrollable turn queue with arrow-tab collapse/reopen, superseding the old left list. No enemy exact HP appears there. Unknown visible identities use `unknown`; hidden enemies remain absent without placeholder slots. Filter names, initials/portraits, accessibility, current-turn indicators and selection behavior to avoid disclosure through list structure.
- Storyteller mechanical wall/door/terrain overlays have full-detail and transparent low-detail states. Bare Alt release toggles states only if no other key participated, the storyteller window is focused, and no text field is being edited. Alt+Q and other chords never toggle detail. Geometry remains translucent rather than disappearing; mechanics remain active.
- Low-detail hides ALL numbers drawn over the map, including movement distances, target badge numbers, obstacle heights, terrain costs, numeric scale labels, and any numeric token-label content. Preserve nonnumeric marker shapes/labels. Inspector/sidebar/panel values remain visible. The scale bar remains drawn but its numeric annotation is suppressed in this mode. This overrides the earlier narrower mechanical-overlay-number interpretation.
- Approved starting points for the next draft, not final visual sign-off: mechanical overlays 20% opacity in low-detail mode; other tokens 30% opacity during hover emphasis; dead portraits 35% opacity; explored terrain dimmed by 60%. Keep zero-HP-but-not-dead portraits opaque. Apply hover/death state distinctly and preserve a legible health outline. Review actual combined states in light and dark modes.
- Player view keeps unexplored areas opaque and explored-but-unseen terrain dim. Hide wall editing geometry and private mechanical labels. Show public doors and terrain effects according to visibility; this does not reveal entities hidden by fog or storyteller control.
- Grid lines are uniform, thin and neutral; no stronger fifth lines or coordinate labels are approved. Hide the grid when visually too dense, without changing snapping, 5-foot scale, geometry, or distance math. Keep a scale bar visible. Exact zoom thresholds and line colors require visual review in light/dark modes.

### Screen and component specification requirements

For every screen, record: its purpose, entry/exit actions, panel sizes/minima, primary fields and controls, sorting/filtering, selection behavior, keyboard behavior, scroll ownership, empty/loading/error states, and what can appear on the player monitor.

For each visual element, record exact states and meaning. Token selection, active turn, targeting, hidden status, zero HP, conditions, and movement warnings must be distinguishable when combined.

Record sizes in logical UI units with 1080p examples and 4K/scaling behavior. Do not shrink controls/text proportionally to world zoom or add decorative elements to fill spare space.

Review wireframes before selecting final dimensions and color values. Visual drafts are review material, not production application code. Pending choices remain explicit; approved answers supersede drafts.

## 5. Review boundary

Only movement behavior is approved from PROPOSED_DETAILS.md. This graphical design review can choose visual representations without silently approving the remaining rules, persistence, and character-editing proposals in that document. Track those approvals separately.
