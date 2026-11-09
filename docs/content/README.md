# S01 source acquisition and audit

Start with [S01_HANDOFF.md](S01_HANDOFF.md), [CONTENT_INVENTORY.md](CONTENT_INVENTORY.md), [SRD_5.2.1_AUDIT.md](SRD_5.2.1_AUDIT.md), and [ATTRIBUTION.md](ATTRIBUTION.md).

## Offline verification

Python 3 standard library only; no application/package changes or downloads:

```powershell
python docs/content/audit-snapshot.py
python -m unittest discover -s docs/content -p 'test_*.py' -v
```

The verifier recalculates every raw byte hash and Git blob identity, compares the exact selected file set against `origin-blobs.json`, parses every fixture row/identity, derives typed relationships from the pinned model source AST (without executing upstream code), checks generic cross-reference endpoints, and compares regenerated evidence with checked-in files. A known source defect is a recorded diagnostic, not a silently accepted correction. This verification is not a mechanics or application-bundle test.

`record-index.json` lists every model/PK/file identity. `reference-audit.json` lists relation counts, excluded icons, invalid ability scores and fractional-price diagnostics. `parity-audit.json` records the published patch-content presence checks and explicit stat-block discrepancies. `relations.json` is derived evidence, not the B01/S02 domain schema.

## Explicit maintenance only

```powershell
# Network: fetch the hard-coded immutable commit and official audit PDFs.
python docs/content/acquire-snapshot.py
# Or repeat file selection from an existing repository ZIP, offline.
python docs/content/acquire-snapshot.py --archive .cache/s01/upstream.zip
# Independent network verification against GitHub's Git tree.
python docs/content/acquire-snapshot.py --verify-origin
# Only after reviewing source and audit changes:
python docs/content/audit-snapshot.py --write
python docs/content/audit-snapshot.py
```

Acquisition copies only the `srd-2024` directory, its whole-file lookup/license/publisher dependency closure (excluding images), repository notices and model source used as schema evidence. The complete repository archive is temporary/ignored; it is not vendored. `--verify-origin` saves only selected upstream blob identities, not unrelated content. Git's scoped `data/upstream/.gitattributes` disables text conversion to preserve all raw bytes across Windows checkouts.

The acquisition tool is never imported into the application or invoked by its install/build/start commands. A source update requires an explicit new pin, reviewed file/delta audit and correction revision. PDFs are audit inputs only; their recorded hashes allow later retrieval checks. The app remains independent of Open5e's API and of these maintenance network commands.
