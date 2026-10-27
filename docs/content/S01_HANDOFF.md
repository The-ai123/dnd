# S01 completion handoff

Owner: Codex — S01 implementation chat. Date: October 27, 2026. Branch: `codex/s01-open5e-snapshot`.

S01's acquisition/audit acceptance deliverables are finished on this branch. Shared root planning documents/WORK_BOARD.md remain owned by other active lanes and are intentionally not edited here. The coordinator should integrate this branch, link this evidence and update the S01 board row before consuming it as a Complete prerequisite for A02/S02. No A02, S02, S03 or F05 completion is claimed.

## Evidence against S01 acceptance

| Acceptance | Delivered evidence |
| --- | --- |
| Immutable source | Open5e commit `e69ac13b49dae6a9d84abf38fc674fe1db5b392b`, resolved from staging before download; 77 raw files, SHA-256 and Git blob hashes/URLs in `data/upstream/open5e/<commit>/manifest.json` |
| No scraping | Published repository ZIP extraction only; official PDFs/patch notes used as audit references, not scraped records; no live API/build/start dependency |
| Unchanged source | All 77 files independently match GitHub's pinned Git tree; selected blob receipt in `origin-blobs.json`; scoped Git attributes preserve raw bytes |
| Actual inventory | 6,743 SRD rows across 33 JSON files, plus 144 shared dependency rows; every model/PK/file in `record-index.json`; category counts in `CONTENT_INVENTORY.md` |
| References | 15,641 typed/generic links checked; zero unresolved non-image targets, zero duplicate model/PK identities; 15 excluded image links explicitly listed in `reference-audit.json` |
| License/provenance | Original repository/license/publisher/document fixtures retained; `ATTRIBUTION.md` distinguishes software, SRD versions and shared core, with notices and downstream packaging requirements |
| 5.2.1 audit | All published patch changes dispositioned in `SRD_5.2.1_AUDIT.md`; 15 missing magic items; Knight/Octopus present; four sampled field discrepancies, one matching field and a size-choice limitation recorded; no unsupported parity claim |
| Reproducible checks | Offline evidence verifier and six regression tests; independent origin verification; acquisition and audit commands documented in `README.md` |

## Validation

- `python docs/content/acquire-snapshot.py --archive .cache/s01/upstream.zip`: reproducibly selects the same raw snapshot and relationship schema without network access.
- `python docs/content/acquire-snapshot.py --verify-origin`: PASS, all 77 raw files match the immutable upstream Git tree.
- `python docs/content/audit-snapshot.py`: PASS, recalculated byte hashes, file set, inventory and diagnostics match the evidence.
- `python -m unittest discover -s docs/content -p 'test_*.py' -v`: PASS, six tests, including byte tampering, extra/missing raw files and stale reference evidence. Tests ran outside the sandbox because its temporary directory permissions denied isolated test copies.
- Official PDFs: extracted with pypdf; legal and affected creature pages rendered with pypdfium2 and visually checked. Source hashes/method in `audit-sources.json`.
- Application runtime tests are outside this data-only change; no package/dependency/lockfile or production runtime file is changed.

## Consumer requirements

A02 can use the actual inventory to enumerate coverage and exclusions after integration. S02 must supply reviewed, attributable 5.2.1 additions/corrections, preserve document/ID/revision provenance, handle shared 2014-tagged lookups without overriding 2024 rules, diagnose the 46 fractional source prices, and exclude unlicensed/unselected icon references. S03 must not label the bundle 5.2.1 complete while the recorded gaps remain. F05 executable mechanics remain a separate gate.

The snapshot's 760 magic-item rows include variants and its 1,812 class-feature-item rows include progression/table children. Counts and resolved database links do not prove complete PDF transcription, editor support or executable automation. Root plans' earlier “not acquired” statements describe the pre-integration state; this handoff is the branch's evidence for the coordinator's reconciliation.
