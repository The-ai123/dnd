# Worlds and session-owned history

Status: A01 state/ownership/behavior contract approved through October 27, 2026. Implementation is authorized; exact fields/UI and task-specific validation remain assigned below. This document supersedes earlier single chronological campaign-action-history and same-record completed-session reopening requirements.

## A01 contract — session lifecycle and reservations

Approved by the user in the A01 product-contract chat on October 27, 2026. This contract supersedes older lifecycle, ownership and proposal wording. Recovery's exact historical-prefix contract is in DATA_AND_RECOVERY.md; downstream exclusions are listed at the end of this contract.

| State/action | Durable result | Reservation behavior |
| --- | --- | --- |
| New / Continue completed session | After required backup, atomically create In Progress session in present state and reserve the campaign party; Continue links to its completed source | Block if party is reserved elsewhere; no duplicate canonical party. Other shared NPCs/locations join when committed into play |
| In Progress | Session may accept actions when focused | Membership reservations remain held until completion |
| Pause / Switch / close view or application | Changes focus or presentation; no durable Paused session state | Retain reservations; no implicit completion or time advance |
| Resume | Focus existing In Progress session using current saved state; no rewind | Retain and enforce ownership |
| Prepare / autosave map draft | Private isolated setup; no new live membership or canonical mutation | Do not acquire new shared-record reservations; existing reservations stay held |
| Start prepared map | Atomically validate base versions, capacity and ownership, commit setup and acquire new membership reservations | Block if another session owns a needed record; preserve draft and old live scene on failure |
| Mark Complete | Seal session action history; preserve current HP/effects/areas and clock | Release owning session's reservations |
| Complete | All fields frozen, including title, summary notes and tags; replay read-only; Continue creates a separate linked session | Cannot resume recording, edit metadata or reopen completion; corrections belong in a new/current session |

Starting a new session while a prior one is incomplete still offers Complete Previous or Leave Incomplete. Leaving it incomplete does not release the party: another session requiring that party cannot start until the owner completes. Multiple In Progress sessions may exist when their reserved records do not overlap; focus is not ownership. A draft cannot bypass reservations. No Continue Anyway path is authorized for conflicting ownership. Completion freezes all session fields, not just gameplay outcomes.

Acceptance cases: switching away/restarting retains reservations; Resume never restores old party values; two drafts may refer to the same unreserved NPC but only the first successful Start acquires it; the second Start blocks without partial state or public-scene changes; completing the owner permits a later valid Start.

Creation acceptance: session A reserves the campaign party immediately. Choose Leave Incomplete and attempt session B with that party: B is not created. Complete A, obtain the required backup, then create B successfully with the same canonical party in present state. A different campaign with a disjoint party may have its own In Progress session.

### Shared-effect clocks and location ownership

Approved by the user on October 27, 2026:

- Timed effects on a shared NPC follow the campaign of the most recent committed gameplay interaction. In the A-to-B example, B controls the remaining duration, preserved at handoff rather than reset or compared against unrelated campaign dates. Viewing a sheet, browsing, and private drafts do not switch ownership. Campaign dates remain independent; no simultaneous countdown under two clocks. When a move changes the context of a turn-relative effect, ask the storyteller how its trigger carries over before committing the move. Preserve remaining duration and record the choice; do not invent turns or silently remove the effect. Reservations still apply.
- Saved locations hold shared world facts. Templates hold reusable starting layouts. Encounter instances hold their own positions, doors, terrain and combat state. Template edits apply to future encounters; they do not silently rewrite existing encounters.
- NPC HP, inventory and effects remain canonical world state. Encounter placement does not create a private copy of those values. An encounter door/terrain edit does not automatically rewrite the template or shared location facts. Deliberate edits to world facts remain canonical and durable.

Acceptance cases: after the relevant interaction in B, the NPC's timer is controlled by B rather than A; no campaign date is synchronized. Edit an encounter door or terrain, then create a fresh encounter from the unchanged template: it starts from the template. Change the NPC's HP in that encounter: other permitted views of the canonical NPC show that HP. Change a shared location fact: world/campaign views refer to that same fact.

Further approved October 27, 2026: a saved location may have multiple reusable area templates. A canonical creature has at most one current encounter placement; moving between encounters is explicit. Fresh preset generation creates a distinct creature identity. A transfer must retain canonical state and satisfy session reservations; moving a token is not permission to release ownership or duplicate the creature. Historical replay and private setup previews are not additional current live placements.

Placement acceptance: placing the same canonical creature into a second current encounter requires an explicit move, rather than a duplicate placement. Generating a second creature from the same preset creates a different ID. Two templates associated with one location can initialize different layouts without copying or replacing the location's shared facts.

Transfer acceptance: a creature with an effect tied to a particular turn cannot silently move to another encounter and lose/restart that effect. Obtain and record an explicit trigger-handoff ruling before committing the move; canceled or invalid transfers preserve the original placement/effect. No ruling overrides another session's reservation.

### Rules input, resource use and preset arithmetic

Approved by the user on October 27, 2026. These decisions approve the listed behavior, not every proposal in PROPOSED_DETAILS.md sections 2–7.

- Manual roll input has explicitly labeled raw-dice and final-total modes. Ask for any missing natural-roll/critical information needed to resolve the outcome; do not infer it from a final total.
- An action and its linked consequences form one undoable action group. Redo/replay uses recorded outcomes. This includes linked resource expenditure and target/reaction/effect consequences; an interactive resolution may still have durable phases as described in ARCHITECTURE.md.
- Insufficient action/resource allowance warns and permits execution once required targeting/ruling inputs are supplied. Record excess spending separately while usable balance stays at zero. Do not manufacture resources or silently reset spent allowances. Unlimited-use features do not need a fabricated finite counter.
- Ask the storyteller to order ambiguous simultaneous triggers; do not invent an ordering that changes outcomes.
- Preset numeric transformation is `base × multiplier + flat adjustment`, then field rounding/clamping, then explicit per-entity override. Round integer stats down; max HP is at least 1, speed is at least 0. Fractional speed is retained. Show calculations in the generation preview.
- Transform each rolled damage component's amount after critical dice are determined and before target defenses. Do not silently transform dice counts or sizes. Save DC has its own modifier, separate from saving-throw bonuses.

Acceptance cases: a final attack total without required natural-roll information prompts for it; overspending 3 units with 1 usable unit leaves 0 usable and records 2 excess; undo restores the linked resource and target changes and redo reuses the same rolls. A base integer stat of 11 with ×1.5 +1 becomes floor(17.5) = 17 before an explicit override; a transformed max HP below 1 becomes 1; a negative transformed speed becomes 0. Damage preview shows the rolled component, transformation and subsequent defenses separately.

### Implementation boundaries and remaining task-specific approvals

These are exclusions from A01 completion, not approved defaults. Consumers may implement the approved invariants but must not fill these gaps by treating proposals as decisions.

| Responsible task | Remaining specification / validation | Boundary until satisfied |
| --- | --- | --- |
| A04 | Quantified routing optimality/numeric tolerances, representative hardware, performance budgets and feasibility evidence | May investigate/prototype against approved movement cases; cannot certify optimality/performance without agreed criteria and measured evidence |
| A05 | Exact editor fields, field-specific ranges, raw invalid/incomplete input handling, layouts, save/error states and progression UI | Architecture already separates raw drafts from validated gameplay values; no invented field schemas or automatic coercion of incomplete numbers into game state |
| S01 / A02 | Actual source inventory, exclusions, per-entry progression/automation coverage | No presumed catalog completeness or handler coverage |
| B03 / E02 | Supported image formats, decoder/resource limits and failure behavior | Preserve originals; no silent decoder fallback/destruction or fabricated format support |
| B01–B08 | Concrete runtime schemas, version/dependency checks, recovery continuations and migrations | Enforce this contract and ARCHITECTURE.md; fixtures do not count as production completion |
| C03 / C04 / A05 | Import/restore/Trash naming, path collisions, archive validation and handoff screens | Separate world-instance identities and preserved internal links; no overwrite of source/existing world, no partial source mutation, no silent deletion or pruning |
| D02 / F02 / F03 | Transfer commands, supported effect/trigger fields, nested reaction/resolution machinery | Single current placement, canonical state, explicit trigger handoff and reservation checks remain mandatory; no silently invented rule outcomes |

Completed-session acceptance: attempts to edit title, tags, notes, outcomes or status fail without changing the sealed record. Continue creates a new linked session and leaves every source field unchanged. Historical restore recovers the status at its chosen revision in a different world; it does not reopen the completed source session.

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
- Shared records become reserved when included in an In Progress session, not merely because they exist in the world library or are mentioned in a note. Block use in another session until completion of the owning session. Reserved records can be browsed read-only in World Manager; edits go through their owning session. The A01 contract above defines focus-only pause/switch and reservation timing for private map drafts.
- Block undo when it would overwrite newer changes from another session; offer a new corrective action against current state. Session-bound undo does not grant permission to overwrite canonical changes made elsewhere. Extend this validation to redo before implementation.

## 2. Proposed conceptual hierarchy

Confirmed clock/portability scope: each campaign has its own game clock. Shared world changes apply in action order, without synchronized dates. Real-world waiting never advances game time. MVP portability is full-world export/import only, including campaigns and required shared records/assets/session histories. Standalone campaign portability is deferred, superseding earlier requirements. Do not implement a synchronized world clock.

| Scope | Confirmed responsibility | Still to define |
| --- | --- | --- |
| Application/global library | Reusable versioned definitions/assets, app settings | Relationship to world-owned definitions and export dependencies |
| World | Canonical shared records, campaigns, grouped chooser, manager, session list and reservations; no synchronized world clock | Exact manager fields/layout in A05 |
| Campaign | One canonical party, independent clock, prepared encounter references and sessions; full-world portability only | Exact definition/override fields in A05 |
| Session | Own history; start in present; immediate party reservation; optional continuation link; bounded conflict-aware undo; all fields frozen on completion | Concrete persistence/command schemas in B01–B08, UI in A05 |
| Encounter/area instance | Instance positions/doors/terrain/combat state; references canonical creatures, one current placement each | Concrete transfer/checkpoint schemas in D02/B07 |

This is a conceptual map, not a final database schema or permission to create isolated party state for every session.

## 3. Requirements for history/storage implementation

1. Apply the A01 ownership boundaries above: shared location facts and NPC HP/inventory/effects are canonical; reusable layout belongs to templates, instance positions/doors/terrain/combat state to encounters. Multiple templates per location and single current placement per creature are approved; exact fields remain A05.
2. New/Continue uses present state; gameplay branching is deferred. Historical world restoration is separately approved in DATA_AND_RECOVERY.md. Specify continuation presentation and replay checkpoints in the dependent tasks.
3. Undo blocks overwriting newer external session changes and offers corrective actions. Define dependency checks, redo validation, and corrective-action UI; never force-delete newer session history.
4. Multiple In Progress sessions may exist with disjoint reservations; starting another prompts Complete or Leave. The A01 table settles status, focus, Resume, immediate party reservation at creation and new draft reservations at Start. Leave Incomplete cannot bypass a party conflict.
5. World Manager edits unreserved world records; reserved records are read-only with owning-session/Open Session. Define unreserved-record version history, save status and recovery; do not silently drop edits from record history.
6. Campaign clocks are independent; shared-record changes apply in action order. Shared-NPC timed effects follow the most recent committed gameplay interaction, preserving remaining duration; viewing/browsing/private drafts do not switch ownership. Transfers changing turn-relative context require an explicit recorded storyteller choice before commit. Use DATA_AND_RECOVERY.md for historical-prefix/status recovery; concrete archive/replay schemas belong to C03/G01.

## 4. Session control semantics

- **New:** create a session with its own history from present persisted world/campaign state; prompt Complete Previous or Leave Incomplete when applicable.
- **Resume:** continue an existing incomplete session; no independent party duplication is implied.
- **Continue:** create a new linked session from present state with the same creation backup/party-reservation checks. Preserve every completed source field; this is not historical restoration or gameplay branching.
- **Mark Complete:** freeze every session field, finalize its action history and release its reservations; do not reset HP/effects/areas or advance time. Metadata corrections require a new/current session rather than edits to the sealed source.
- **Switch Session:** focus another session without completing others or rewinding shared state. Resume an In Progress session against current saved state and enforce its reservations and record-version checks; no durable Paused state.
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

The A01 contract above resolves lifecycle, reservations, canonical/instance ownership, clock/turn handoff and completed-record immutability. DATA_AND_RECOVERY.md resolves historical prefix/status recovery. Unreserved edits remain in durable world history as required by ARCHITECTURE.md; exact schemas/UI and implementation evidence remain in the assigned downstream tasks.

Use the approved contract above and ARCHITECTURE.md's A01 register over legacy review notes. Implement session-owned histories and durable world revisions, retaining the explicit task-specific exclusions; do not reintroduce flat campaign gameplay history or same-record completed-session reopening.

## 7. Future world simulation — explicitly outside MVP

The user would like an economy that responds to player actions: for example, destroying a bridge could disrupt trade, supply, availability, or prices. This is a far-future concept, not a requirement to implement an economy, transport simulation, automatic trade routes, cascading consequences, or shop-price/restock simulation in MVP. Preserve this idea for later design; do not infer formulas or implementation dependencies from it. MVP loot/shop rules remain the approved budget/table generator and persistent editable stock.

## 8. Clock and portability acceptance checks

Recovery/import follows DATA_AND_RECOVERY.md: import/restore create separate worlds, original world/later history stays unchanged, backup before restoration and session start, durable content/game history included and transient UI excluded. Delete sends world plus associated backups to indefinite Trash; Empty Trash lists contents and requires confirmation. Recovery is distinct from present-state session continuation and deferred gameplay branching.

1. Advance campaign A's game time: campaign B's clock stays unchanged. An explicit shared-NPC mutation from A nevertheless appears in B; do not reconcile dates automatically.
2. Export/import a full world on a clean installation: verify campaigns, shared identities/links, party state, session histories/replay, areas/staging and required images remain usable offline. Archive contents and import overwrite/identity policy still need specification.
3. Data & Backups offers world export/import, not standalone campaign packages. Existing campaign-folder opening is not a portable export feature.
