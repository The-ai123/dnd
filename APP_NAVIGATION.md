# Application navigation and systems outside the map

Status: discovery. This document defines the launch experience, campaign management, preparation screens, and transitions into/out of play. Navigation choices below are proposals until confirmed. Implementation is authorized; unresolved product and screen contracts still gate dependent tasks.

A01 lifecycle revision, approved October 27, 2026: session status is In Progress or Complete. Pause/switch changes focus only, Resume uses current saved state, party reservation happens at creation, and reservations persist until completion. Leave Incomplete does not permit another session to acquire that party. Private map drafts acquire new shared-record reservations only at successful atomic Start; conflicting ownership blocks Start without changing the old live scene. Every completed-session field is frozen, including title/notes/tags; Continue creates a new linked session. See WORLDS_AND_SESSIONS.md's consolidated A01 contract, which supersedes legacy lifecycle/reservation wording below. See UI_EDITOR_CONTRACT.md for the approved screens and fields.

**Active revision:** [WORLDS_AND_SESSIONS.md](WORLDS_AND_SESSIONS.md) supersedes flat campaign action history and completed-session reopening below. Add World above Campaign; sessions own their histories, campaign/world views list sessions, completed-session continuation creates a new linked session; branching is deferred. Sharing/state boundaries are being clarified before navigation is consolidated.

Confirmed revision details: world NPCs/locations are canonical live records. Undo stays inside a session and blocks overwriting newer changes from other sessions, offering corrective actions. Completion freezes all session fields. Starting another session offers Complete Previous or Leave Incomplete; shared players/locations/NPCs are BLOCKED until their owning session completes (supersedes warnings). New/Continue uses present state; Continue creates a new linked session, with gameplay branching deferred. Unreserved world-record edits have durable world revisions; reserved edits go through their owning session.

World navigation: each campaign belongs to one world. Chooser groups campaigns by world; New Campaign chooses an existing world or creates one. Normal launch restores the last campaign/tabs. World has shared NPC/location tools and a session list; exact screen layout remains graphical discovery.

World Manager is confirmed: Overview, Campaigns, Characters & NPCs, Locations, Lore, Sessions, World Settings; searchable lists/details editors; accessible from world chooser and a button beside campaign switcher. In Progress session membership reserves shared records; reserved records appear read-only with owning-session details and Open Session, and must be edited through that session. The A01 state table governs lifecycle and membership timing. A reactive world economy is explicitly far-future, not MVP scope; see WORLDS_AND_SESSIONS.md section 7.

## 1. Confirmed context

Data & Backups / Trash follows [DATA_AND_RECOVERY.md](DATA_AND_RECOVERY.md): import and historical restore create separate worlds; restore first backs up current state, leaves original/later history unchanged, and restores durable content/game state rather than transient UI. New sessions create backups. Delete moves world and associated backups to indefinite Trash; Empty Trash shows contents and requires confirmation. Fixed 20-point/7-day retention was not approved.

- Windows application, offline, local campaign files; no account requirement is established.
- Two separate windows during play: private storyteller and public player window.
- Worlds contain campaigns and canonical shared records. Campaigns contain one party, saved areas and sessions; sessions own action histories.
- Users need manual content editors, SRD-based character creation/leveling, entity/preset/variant generation, saved-area preparation, asset management, replay, full-world export/import, backups, and settings.
- Rules-content importing and standalone campaign portability are deferred. MVP portability is full-world export/import with shared dependencies.
- Each campaign has an independent game clock. Shared world-record changes apply in action order without synchronized dates.
- Lightweight information-first design; follow Windows light/dark appearance; Comfortable and Dense modes.
- Gameplay behavior and private/public separation follow PROJECT_PLAN.md and GRAPHICAL_DESIGN.md.

## 2. Navigation review sequence

| Order | Decide | Resulting specification |
| --- | --- | --- |
| 1 | Launch destination, campaign home, reusable-content scope, additional systems | Top-level screen list and navigation hierarchy |
| 2 | Campaign create/open/switch/close and recovery | Exact entry/exit flows and save/player-window behavior |
| 3 | Libraries and editors | Entity, preset, variant, image, spell, character-option, and area workflows |
| 4 | Party and character workflows | Party membership, creation/leveling, sheet editing, transfer and storage |
| 5 | Session/history/replay and optional planning tools | Browse/resume/review navigation and state boundaries |
| 6 | Settings and data management | Global/campaign scope, backups/export/import, shortcuts, displays, appearance |
| 7 | Launch/management wireframes and implementation handoff | Exact screen contracts, transitions, error/empty states, dependency-ordered tasks |

## 3. Foundational decisions

| ID | Decision | Status |
| --- | --- | --- |
| N01 | Restore last campaign/tabs/focus; fallback chooser has recents, New, Open Folder, Import, and Locate/Remove from Recents for missing paths | Confirmed |
| N02 | Home: small grid of labeled tool buttons, with Resume/party/prepared areas/recent activity below | Confirmed; exact buttons/dimensions/fields pending |
| N03 | Global library feeds versioned campaign copies; Update Available previews differences/dependencies before explicit update; existing generated entities/live areas stay unchanged until explicitly edited/regenerated | Confirmed; initial-copy/publish-back workflow pending |
| N04 | Approved Home grid and Library categories in section 8; campaign/content/party/history/backup/settings plus notes/quests/lore/loot/shop tools | Confirmed navigation; screen-level fields pending |
| N05 | Reopen player window at launch if it was open last time; retain last public map while storyteller prepares | Confirmed; restore/loading safeguards and live-versus-snapshot behavior pending |
| N06 | Home hub, closable tabs; restore all/focus last-used; one tab per record and one Play per campaign; closing Play leaves public area/state intact | Confirmed; app exit/recovery details pending |
| N07 | Simple rich text with headings/lists, images, tags, record links; quests add editable status; advanced structures deferred | Confirmed; exact fields/public sharing pending |
| N08 | Shop generator uses approved formula and shuffled passes below; default target 70%, max 10 passes; one affordable unit per success; manual over-budget edits warn but can finalize | Confirmed algorithm; valuation/zero-cost and draft lifecycle pending |
| N09 | Sessions own histories; completing preserves record; Continue creates new linked session; world/campaign history lists sessions; Home/top-bar controls retained | Revised by user; initial state, undo boundaries and multi-active semantics pending in WORLDS_AND_SESSIONS.md |
| N10 | Single-line commits on field departure/Enter; multiline Enter inserts line, Ctrl+Enter/departure commits; raw invalid drafts separate from valid values; encounter actions save as whole action groups | Approved in UI_EDITOR_CONTRACT.md, including fields and version behavior |
| N11 | New Campaign requires name/local folder, optional description/image; use SRD 5.2.1 defaults, open empty Home, add party/areas afterward | Confirmed |
| N12 | New-map selection holds public view with Selecting new map; private autosaved staging survives restart; Start commits setup together and publishes player-camera preview; Cancel resumes previous live map with Keep Draft or confirmed discard | Confirmed; detailed state/validation contract below |
| N13 | Searchable tables/lists with tags/filters and preview/details panel; Images and Areas also offer thumbnail grids | Confirmed; columns, filters, sorting and preview actions pending |
| N14 | One party per campaign in MVP; multiple parties deferred | Confirmed; roster/presence UI pending |

## 4. Candidate screens and their responsibilities

This is a coverage checklist, not an approved menu or promise to expose every item as a separate screen.

| Surface | Responsibility | Confirmed capability / pending presentation |
| --- | --- | --- |
| Launch / campaign chooser | Restore last campaign/tabs/focus; otherwise recents/New/Open Folder/Import, missing-path Locate/Remove | Confirmed flow; exact layout pending |
| Campaign home | Resume last session, party summary, prepared areas, recent activity, preparation navigation | Priorities confirmed; layout pending |
| Party / characters | Persistent party roster, entity sheets, character creation and leveling | Required; exact navigation pending |
| Entity library | Store characters/NPCs/enemies independent of area placement | Required; global/campaign ownership pending |
| Presets / variants | Define presets and modifier profiles; preview/generate entities | Required; combined versus separate editor pending |
| Areas | Browse saved templates/live states; prepare an area; enter/resume play | Required; transitions/reset behavior pending |
| Images | Import, preview, organize, assign, find usage | Storage/selection required; organization tools pending |
| Rules / custom content | Bundled-content availability, spells, supported custom options | Required; catalog/editor structure pending |
| Session / history / replay | Browse campaign chronology and select replay ranges | Required; session grouping/presentation pending |
| Data / backups | Full-world export/import, backup recovery, save status | Required; standalone campaign portability deferred |
| Settings | Appearance & Density, Controls, Player Window, Storage & Recovery, Rules & Defaults, About & Attribution | Sections approved; field-level layout pending |
| Notes / quests / lore / loot / shops | Session notes, quest tracking, world/location reference, rewards and commerce | Required in MVP; data/editing/gameplay boundaries pending |

### Confirmed launch and ownership model

- Normal launch restores the last campaign's tabs and focuses the last-used tab, including Play if it was active. This supersedes the original Home-at-launch choice. Home remains the hub and the campaign switcher stays available. Reopen the player window if it was open last time.
- Home provides a small grid of labeled tool buttons, with Resume Last Session, party summary, prepared areas and recent activity below. Exact button grouping/fields remain pending. Keep it functional rather than a decorative dashboard.
- Global library stores reusable assets/presets/spells/custom options. Campaigns use versioned copies. Show Update Available when a newer source exists; preview differences/dependencies and explicitly update a campaign definition. Existing generated entities/live areas stay unchanged until explicitly edited/regenerated; historical replays remain intact. Initial copying, update conflicts, and publish-back workflows remain pending.
- Session notes, quests, world/location lore, and loot/shop management are now required MVP systems. Do not collapse these into generic free-text notes unless the user approves that scope. Define how they link to areas/entities and whether their actions affect inventory/resources/history.

### Subsequent confirmed navigation and scope

- Home is the hub, with tools opening in closable workspace tabs; Play is also a tab. This supersedes a persistent preparation sidebar or menu-only navigation proposal. Keep the confirmed internal Play layout unchanged.
- Reopen the separate player window at launch if it was open last time. While storyteller uses preparation tools, retain the last public map. Never route the player window to the storyteller's active tool tab. Restore must respect fog/private-state separation; exact loading/covered-state behavior remains pending.
- Quests and world/lore are intentionally lightweight: simple rich text with headings/lists, images, tags and links to campaign records; quests add editable statuses. Advanced objectives/reward structures, automatic progress, dialogue/world simulation, nested-page systems and complex lore schemas are deferred.
- Loot/shop MVP uses the approved algorithm below. Permit manual over-budget edits with a warning and allow finalization. Save final stock to its shop until edited/regenerated. Purchases/transfers stay manual. Generated draft lifecycle remains to be defined separately from ordinary editor autosave.

### Loot/shop generation decisions and remaining algorithm contract

- Total means stock value budget, not a requested item count or number of distinct entries.
- A05 currency correction: item/bundle prices, shop budgets, generated stock totals and excess/unspent amounts use whole-number gold. Items may be bundled into an explicit priced unit (for example five items for 1 gold). Each successful generator addition adds one priced unit/bundle, with visible bundle and physical-item counts. No fractional gold, copper conversion or silent rounding/bundle inference. Manual stock may be priced at zero gold. Automatic generation requires a positive whole-gold price. See UI_EDITOR_CONTRACT.md for the draft lifecycle.
- Entry chances are independent, not a single weighted 100% choice table. Do not normalize them to sum to 100%.
- Selected tier includes all lower tiers. Each pass shuffles eligible entries and rolls them independently. Tier weights are probability multipliers, not weights for choosing one tier or item.
- Approved formula: chance(entry) = min(100%, base chance × tier multiplier) / 2^n, where n is the number of successful stock additions for that entry in the current generated draft. Reset n for each new generation; do not mutate the source table. Halving occurs after the initial probability cap.
- Each successful addition contributes one stock unit; further successes for that entry are half as likely each time. Do not roll quantities. Duplicate reductions must not permanently mutate the authored loot table.
- Default target is 70% of stock-value budget, maximum 10 passes; both editable. Each success adds one affordable unit; check the target after each addition. An addition may cross the target but must not exceed the full budget. Stop at target, pass cap, or when no affordable positive-chance entries remain. Unspent budget is valid; no forced exact fill.
- Manual draft edits may exceed the generation budget: show stock value and an over-budget warning, but permit finalization.
- Persistent shop stock changes only through explicit edit/regenerate/finalize operations. Opening a shop or changing storyteller tabs must not reroll stock.
- Draft finalization saves stock, not party purchases or currency transfers. Party inventory/currency edits stay manual in MVP.
- Before implementation, define per-unit valuation, currency precision/conversion, zero-cost entries, and generated-draft cancel/regenerate behavior. Probability order/scope, pass iteration/termination, quantities, target and over-budget edits are confirmed above.

### Sessions, restored tabs, and autosave

- Sessions own their action histories; campaign/world history lists sessions. Incomplete sessions can Resume. Completed session histories stay finalized; Continue creates a new linked session in present world state, never appends to the completed one or restores old state. Undo stays inside the session and protects newer external changes.
- Multiple sessions can remain incomplete; starting another prompts Complete Previous or Leave Incomplete. Active-session membership reserves shared records until completion. World Manager shows reserved records read-only with Open Session; other sessions cannot use them. These rules supersede earlier selected-recording-session and flat-history proposals.
- Closing Play only closes the storyteller workspace view and leaves the last public area visible. Ending a session adds its end marker and also leaves that area visible, with no reset or game-time advance. Neither action implicitly ends combat or removes effects.
- Restore all workspace tabs and focus last-used on campaign reopen, superseding Home-first launch. Opening an already-open record focuses its existing tab; different records can occupy separate tabs. Only one Play tab exists per campaign. Safe fallback after unavailable content and close/exit behavior remain pending.
- Preparation editors save on leaving the field or pressing Enter; in-progress typing is not timer-saved. Version history/undo supplies corrections. Do not introduce mandatory Save/Discard dialogs as the default editor workflow.
- A05 user revision (October 27): single-line fields persist/apply on leaving the field or pressing Enter, with no inactivity timer. Multiline Enter inserts a line; Ctrl+Enter or leaving commits. Raw invalid drafts and last valid gameplay values stay separate; in-progress uncommitted typing is not yet durable. Failed saves/conflicts preserve text with Retry/Compare/Copy; leaving the world/exiting requires resolution or explicit abandonment. Notes/lore/quest fields and default editable quest statuses are approved in UI_EDITOR_CONTRACT.md.
- UI_EDITOR_CONTRACT.md defines valid gameplay values, incomplete drafts, save status, edit groups and versioned content behavior.
- Editor autosave does not itself approve applying template/library changes to a running encounter. Generated shop stock remains a draft until explicit finalization; autosaving that draft must not silently replace finalized stock.

### Campaign creation, fallback and switching

- First launch with no prior campaign shows chooser: recent campaigns, New, Open Folder, Import. Missing campaign paths offer Locate or Remove from Recents; removing a recent entry must not delete campaign files.
- New Campaign asks for name and local storage folder, with optional description/image. Initialize SRD 5.2.1 defaults, then open empty Home. Party and areas are added afterward; no mandatory creation wizard for them.
- When switching campaigns, keep the previous campaign's last public map until the storyteller explicitly sends the new campaign's map. Do not automatically publish the destination's map, cover the old map, close the player window, or expose preparation screens merely because the campaign changed.
- After campaign switch, retain a frozen public presentation of the old map. Player pan/zoom remains available, but no live game changes or selection/hover forwarding occurs. Do not retain a second editable campaign just to display that presentation. IDs/labels from the frozen presentation must not act on the newly active campaign.
- Restore all tabs and last focus for reopened campaigns as agreed. Campaign switches must not reset state or count as elapsed game time.

### Area publication and management views

- Latest user revision supersedes automatic same-campaign area publication. Starting a new-map selection freezes the player view and displays Selecting new map. Storyteller chooses the map, performs setup, positions the camera, then presses Start. Only Start replaces the public map and resumes normal behavior.
- Apply this staging principle to new map selection even within the same campaign; do not expose partial setup. Campaign switching still retains the previous public map until explicit publication; Start is the confirmed action for a prepared map, superseding earlier Send-only terminology for this workflow.
- Entity placement, enemy generation, terrain changes, and party-state edits during setup live in an autosaved staging draft. Preserve the draft across restart. Start commits these changes together; before Start they do not mutate the old live encounter or canonical party state.
- Setup includes an explicit player-camera preview rectangle that the storyteller positions independently of the storyteller camera. Start publishes that framing; normal independent camera behavior resumes afterward.
- Cancel New Map returns to the previous live map and unfreezes it. Offer Keep Draft for later or discard after confirmation. This is distinct from the general autosave editor workflow: discarding a staged encounter is an explicit destructive draft operation.
- Browsing a library/editing stored templates versus initiating New Map still needs exact entry controls. Validation/recovery must preserve the confirmed transactional boundary, not silently convert staging into live state.
- Show searchable tables/lists by default with tags/filters and preview/details panel. Images and Areas also offer thumbnail grids. Exact list columns, available filters, sorting, thumbnail size, and record-preview actions still require screen-level specification.
- Record-opening actions focus existing tabs instead of silently duplicating editing surfaces. Shared draft/undo state must remain coherent between a tab and any full editable inspector of that same entity.

## 5. Transition requirements to resolve

- Player window reopens if previously open, retains public map during preparation and freezes on campaign switch. New-map selection uses Selecting new map → autosaved private staging/player-camera preview → Start. Cancel returns/unfreezes previous live map and offers Keep Draft or confirmed discard. Define loading/validation and edit-versus-new-map entry controls.
- Distinguish browsing a saved area, editing its template, resuming its live encounter, and starting a fresh encounter.
- Distinguish leaving the map, ending combat, ending a session, closing a campaign, and exiting the application. Avoid accidental resets/time advances.
- Campaign creation/fallback/switch publication are confirmed above. Define rename/delete/archive behavior and recovery from failed saves.
- Whether management edits made during play immediately affect the encounter, create a future version, or require explicit application.
- Campaign-local versus reusable content ownership, edit propagation, dependencies, and asset usage/deletion.
- Complete field-level session lifecycle/record reservation states without reintroducing flat campaign action history or independent copied parties.
- Navigation persistence: panel positions, recent documents, last screen, selected campaign/area, and reopen behavior after a crash.

## 6. Screen contract required before implementation

For each approved screen, specify entry points, visible fields, actions, list columns/default sort, search/filter requirements, selection and multi-selection, editor save/cancel behavior, destructive actions, dirty/save-failure states, empty/loading/recovery states, and exit destinations.

For every navigation action, state whether it changes game state/history, opens a new window, changes player visibility, advances game time, or merely changes the storyteller view. Preparation screens must never appear in the player window.

Map visual drafting is paused while this outer application structure is reviewed. Previously approved map/inspector requirements remain in force.

## 7. Approved new-map transition contract

| State/action | Storyteller | Player window | Persistent game-state effect |
| --- | --- | --- | --- |
| Normal play | Current live encounter, independent camera | Public live projection | Completed actions update owning session history/canonical state |
| Begin new-map selection | Choose destination | Previous public view held with Selecting new map | No destination/party changes yet |
| Prepare destination | Place entities, generate enemies, edit terrain/party state, position player-camera preview | Held old public presentation | Autosave isolated staging draft; no live mutation |
| Restart with draft | Recover staged work | Restore held public context safely | Draft remains uncommitted |
| Start | Commit prepared setup together | Publish new public area with preview framing; normal play resumes | Destination and staged party changes commit together |
| Cancel / Keep Draft | Return to previous live context | Previous live map unfreezes | Keep isolated setup for later, no staged party mutation |
| Cancel / Discard | Confirm discard; return to previous live context | Previous live map unfreezes | Remove staging changes only; preserve old live state |

Acceptance checks:

1. Change party HP and generate enemies in setup, then restart: draft remains available and old live party/encounter values are unchanged.
2. Position the player preview differently from the storyteller camera; Start publishes the preview's framing, not the storyteller viewport.
3. Cancel with Keep Draft, reopen the draft, and verify its prepared changes remain isolated until Start.
4. Cancel with confirmed discard and verify prior party/encounter values and public map resume without a reset or time advance.
5. Failed Start validation/save must not publish a half-committed destination or partially apply staged party state.

These specify the transactional behavior, not the storage technology. Conflict detection if canonical state changes after a draft was created remains a required implementation specification before this workflow is built.

## 8. Approved Home menu and Library structure

Home uses a small grid of labeled tool buttons, with Resume, party summary, prepared areas, and recent activity below. The campaign switcher stays in the top bar.

| Home button | Destination / scope |
| --- | --- |
| Play | Single Play workspace tab; resume current live state or staged map workflow |
| Areas | Saved templates, existing encounters, and staging entry points |
| Party & Characters | One campaign party, character/entity records, creation/leveling, sheets |
| Library | Reusable and campaign-copy content in categories below |
| Sessions & Notes | Named dated sessions, completion/continuation, linked rich-text notes |
| Quests | Lightweight notes/tags/links with editable quest status |
| World & Locations | Rich-text lore/location notes, images, tags and record links |
| Loot & Shops | Tiered loot tables, budget generation drafts, persistent shop stock |
| History & Replay | World/campaign session lists; session action histories and encounter replay |
| Data & Backups | Full-world export/import, backups/recovery, data management; standalone campaign portability deferred |
| Settings | Six approved sections in section 9 |

Library categories are **Images, Entity Presets, Variant Profiles, Items, Spells, Character Options**. Use global reusable versions and explicit campaign copies/updates as already approved. Items are included as structured references for inventories and loot-table valuation; this does not approve automated buying/selling.

One party per campaign is MVP scope. Multiple named parties or simultaneous party management are future features. Do not implement roster switching or duplicate party-state models for MVP.

Exact button dimensions/icons/order and category-list fields remain graphical/screen-level work. Approved navigation groups are not a requirement for eleven separate application windows; tools use closable workspace tabs as agreed.

## 9. Approved Settings sections

| Section | MVP controls/scope |
| --- | --- |
| Appearance & Density | Follow Windows light/dark appearance; Comfortable/Dense; UI scale |
| Controls | Keybindings; existing text-entry/held-key guards remain required |
| Player Window | Monitor selection and fullscreen |
| Storage & Recovery | World/data/backup folders, recovery tools and Trash access |
| Rules & Defaults | Campaign-specific overrides; exact supported fields still require definition |
| About & Attribution | App/version information and bundled-content attribution |

New Session and Restore World require successful pre-operation backup. Failure blocks the operation with an explanation, Retry and Choose Backup Folder, leaving current world unchanged. No silent bypass.

Settings section approval does not settle exact sizes, editable ranges, shortcut conflict resolution, rule-override schemas or physical storage format. Those remain detailed specification work.
