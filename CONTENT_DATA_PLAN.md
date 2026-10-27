# Built-in D&D dataset plan

Status: Open5e adopted as the planned acquisition source by the user on October 27, 2026. No dataset has been downloaded or audited by this planning task. This is build-time bundled content work, not approval to add a general rules-import UI or runtime network dependency.

Scheduling clarification, October 27: the user considered moving S01 after MVP, then allowed acquisition/data-dependent work to remain in MVP after its catalog/editor/progression/automation dependencies were explained. Retain S01 → A02/S02 → S03 and the existing downstream gates; no source-independent MVP split was applied. S01 may follow independent foundation planning, but must finish before the source-dependent catalog milestones. This note does not authorize downloading data during A05 functional planning.

## Source and boundaries

- Acquire published machine-readable JSON from the [Open5e repository's 2024 SRD directory](https://github.com/open5e/open5e-api/tree/staging/data/v2/wizards-of-the-coast/srd-2024). Use Git or a published repository archive; do not scrape reference webpages or parse site HTML to acquire records.
- The source has creature/actions/traits, spells, classes/features, species/traits, backgrounds, feats, conditions/rules, equipment and other structured files. Enumerate actual files/records after pinning; do not invent counts or claim completeness from filenames.
- [Open5e API documentation](https://open5e.com/api-docs) supports `srd-2024` source filtering, but normal app operation/builds from a checked-in snapshot must not depend on a live API.
- Exact source location today is on a mutable `staging` branch. Select and record a full immutable commit SHA before ingestion. Record retrieval date, file hashes, document keys, content version and all transformation revisions.
- [Source document metadata](https://raw.githubusercontent.com/open5e/open5e-api/staging/data/v2/wizards-of-the-coast/srd-2024/Document.json) identifies SRD **5.2**, `srd-2024`, `5e-2024`, and `cc-by-40`. This does not establish exact **5.2.1** parity. Audit against the [official SRD 5.2.1](https://www.dndbeyond.com/srd) and record corrections/missing entries explicitly.
- Keep required attribution/license material with the dataset and generated bundle. Distinguish Open5e software licensing from the selected SRD content's license. Do not import all Open5e third-party content just because it is in the same repository.
- This supplies the approved SRD subset, not every rulebook, official artwork, or adventure content. Images/portraits are not assumed to be licensed by a rules-data license.

## Ingestion pipeline

1. **S01 — pin and audit raw snapshot:** select commit; acquire only intended source/dependencies/licenses; preserve raw JSON unchanged; inventory IDs/counts; verify source provenance and 5.2.1 differences. Complete source audit before claiming patched-version coverage.
2. **A02 — coverage catalog:** enumerate actual bundled content and references, enabled mechanics, approved lighting/senses exclusions, progression and acceptance cases. Raw inventory can be prepared while unrelated A01 product decisions are open; unresolved gameplay semantics cannot be silently filled in.
3. **S02 — normalize through a versioned adapter:** map upstream fixture-shaped JSON into our validated content schemas. Resolve cross-file references; preserve original IDs/source links/versions and rich text. Emit structured diagnostics for missing references, invalid values, duplicate IDs, ambiguous mechanics and unsupported behavior.
4. **S03 — validate and package:** reproducibly generate an offline bundle plus manifest and attribution. Test counts/references against the pinned inventory, idempotence, representative samples in every category and explicit 5.2.1 corrections. Do not quietly discard upstream fields or unresolved records.
5. **C07 / D01 — install into libraries/editors:** seed immutable built-in definitions and creature/item presets, not canonical live world NPCs. Existing canonical entities are created/referenced explicitly by the user. Custom definitions remain editable/versioned; source updates use the approved explicit update workflow.
6. **F05 — mechanics implementation:** map enabled records to trusted handlers/DSL and acceptance fixtures. Imported spell descriptions are not executable automation. `data mapped`, `mechanics implemented`, `tests passed` and `deferred with reason` must remain separately inspectable coverage fields.

## Planned artifacts (not yet created)

```text
data/upstream/open5e/<commit>/...       # selected raw JSON, license and source manifest
data/corrections/srd-5.2.1/...          # attributable, reviewed patch-parity corrections
packages/content/src/adapters/open5e/ # pure, versioned normalization adapter
packages/content/generated/...         # deterministic validated bundled definitions
docs/content/CONTENT_INVENTORY.md       # actual pinned inventory, category/count/reference audit
docs/content/CONTENT_COVERAGE.md        # per-entry data/mechanics/acceptance/exclusion status
```

Exact schema fields and output filenames follow A01/A05/B01; these paths establish ownership boundaries rather than prematurely defining data models. Add content dependency/correction provenance to the archive/replay format so future updates cannot rewrite historical behavior.

A05 valuation boundary: product item/shop valuations use nonnegative integer gold and may explicitly price bundles. Preserve upstream price/unit metadata and provenance unchanged in raw data. A normalized source value that needs fractional gold cannot silently round or create an inferred bundle; record a diagnostic and obtain an explicit whole-gold single/bundle valuation for generator use. Keep source price metadata distinct from the authored stock valuation and per-campaign override. Source audit remains MVP work; this is a mapping requirement, not acquisition evidence.

## Completion evidence

- S01: exact SHA/hash manifest and 5.2-versus-5.2.1 audit, attribution, category inventory; acquisition uses published files with no scraping.
- S02: repeatable adapter with runtime schemas, full reference resolution or explicit diagnosed failures, retained provenance and reviewed correction layer.
- S03: clean offline build/load from pinned data, bundle hash consistency, import deduplication/version tests, no startup API call.
- F05: separate automation coverage matrix fully passes for every enabled entry. Dataset availability alone never completes F05.

Source updates are an explicit maintenance task: pin newer SHA, rerun audits/diff, review definition changes and regenerate bundle. No unreviewed auto-sync in builds or at app launch.
