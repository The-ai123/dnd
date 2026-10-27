# World history, backups, import and Trash

Status: A01 historical-state/prefix behavior approved October 27, 2026. Implementation is authorized; C03/C04 still own archive validation, collision handling and recovery presentation. This document supersedes earlier fixed-count rolling-backup proposals and standalone campaign portability requirements.

## 1. Confirmed scope

- MVP exports/imports full worlds only. Standalone campaign portability is deferred.
- Import creates a separate imported world by default; never automatically overwrite an existing world. Preserve internal record links and history.
- History covers all durable world content and game changes: NPCs, locations, campaigns/parties, sessions/actions, notes, templates, shops, images and setup drafts. Exclude transient UI state such as hover, open inspectors and tab focus.
- Restore creates a separate world at the selected historical state, leaving the current world and its later history unchanged. This is not an in-place rollback.
- Before restoration, create a backup of the current world.
- Starting a new session creates a backup.
- If the required backup before New Session or Restore World fails, block the operation, explain the failure, and offer Retry or Choose Backup Folder. Leave the current world unchanged; no Continue Without Backup path.
- Do not permanently delete a world through ordinary Delete. Move it into an application Trash that can be emptied explicitly.
- Trash retains the deleted world and its associated backups without automatic expiry. Restore returns it to the available worlds. Empty Trash shows what will be permanently removed and requires confirmation.
- The proposed latest-20-recovery-points plus seven-daily-backups policy was not approved. Do not implement that as a confirmed requirement.
- Autosave remains required: preparation edits save as typed, completed gameplay actions save together, staged map setup remains isolated until Start.

### A01 historical restore contract — approved October 27, 2026

Restore the exact durable historical state and only the history prefix through the selected point into the separate world. Recover session states, membership and reservations as they existed then. If session A was In Progress at the target but later completed in the source, A is In Progress with its historical reservations in the restored copy. Later source actions and completion do not appear in the restored prefix; the source and all its later history remain unchanged. Keep the required pre-restore backup.

The architecture's new world-instance ID qualifies the copied internal record/session IDs, preserving links without letting commands or reservations address the source world. Recover historical drafts as private drafts, not implicit live reservations. A restoration point must identify an acknowledged durable revision; pending choices cannot be mistaken for committed outcomes. Interrupted multi-phase actions retain their recorded committed phases and recovery context rather than rerolling or inventing a final outcome.

Acceptance: restore before a source session's completion and verify it is In Progress with the then-current party/NPC reservations; restore after completion and verify it is Complete with reservations released. Neither operation changes the source. Replay/restore never imports the source's later suffix into the recovered world.

## 2. Distinct operations

| Operation | Confirmed purpose | Pending detail |
| --- | --- | --- |
| Session undo | Reverse actions inside current session, with cross-session conflict protection | Exact dependency checks |
| Session replay | Inspect historical outcomes and visibility without changing live state | Playback timing/layout |
| Continue completed session | New linked session in present state | Low-priority UI detail |
| Restore world to history point | Back up current world; separate world with exact historical state/prefix and then-current session reservations; original/later history unchanged | Naming/collision presentation and restore handoff UI |
| Start session backup | Preserve world before session changes; failure blocks New Session with Retry/Choose Backup Folder | Naming and backup browsing |
| Import world | Create separate imported world preserving internal links/history | Identity remapping/asset validation and display names |
| Delete world | Move world and associated backups to application Trash, retain indefinitely | Packaging, recovery metadata and name/path conflicts |
| Empty Trash | Show contents and require confirmation; permanently remove trashed worlds and associated backups | Exact confirmation UI/file integrity checks |

World restoration is a recovery action distinct from normal session continuation or gameplay branching. The user has requested recovery to earlier state; this does not authorize a branching-session UI.

## 3. History completeness and ownership

- Existing session-owned action histories and finalized completed-session histories remain requirements.
- World Manager edits, preparation, notes, assets, game state and setup drafts are included in durable history coverage. Record sufficient session status/reservation state to recover a coherent world. Session combat events alone do not reconstruct a world.
- Retain the revisions/assets and cross-record ordering necessary for approved restoration scope. Choosing an event-log/storage technology is later architecture work.
- Transient hover/inspector/tab-focus state is excluded from restoration. Distinguish game-relevant saved staging/player-camera framing from a transient inspection camera; do not discard durable staged setup under this exclusion.
- Preserve original finalized session histories and later original-world history when creating a restored copy. Apply the approved A01 historical prefix and reservation contract above. Specify player-window handoff and atomic restored-world creation in C03. A failed restore cannot partially alter the source world.

## 4. Required acceptance cases after decisions

1. Import into an installation already containing the source world; the existing world remains untouched and the imported copy's internal links/history remain valid.
2. New Session/Restore backup failure blocks the requested operation, reports the failure, offers Retry/Choose Backup Folder and leaves the current world unchanged. Successful retry must not create duplicate sessions or partial restores.
3. Restore to an earlier point: verify a separate world is created, current-state backup exists, original world/later history remains unchanged, and restored content is internally coherent. Test shared NPCs/locations, party state, sessions, notes, images, templates, shops and setup drafts; do not replay transient hover/tab-focus state.
4. Delete a world: it appears in Trash rather than disappearing permanently. Restore it from Trash using the agreed conflict policy.
5. Leave a world in Trash over time: no automatic expiry. Empty Trash shows affected worlds/backups and requires confirmation; ordinary delete/import/restore never implicitly empties it.

Restore destination, exact historical prefix/status/reservations, separate world-instance identity, durable-history coverage, Trash retention and failed-backup policy are confirmed. Backup/history pruning is not authorized. C03/C04 still own archive/asset validation, naming/path collisions and handoff screens, subject to no source overwrite or partial mutation. Do not add automatic pruning or irreversible history compaction without an approved policy.
