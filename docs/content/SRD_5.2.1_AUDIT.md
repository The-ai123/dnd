# SRD 5.2.1 source audit

Audit date: October 27, 2026. Raw snapshot commit: `e69ac13b49dae6a9d84abf38fc674fe1db5b392b`.

**Result: the selected Open5e data is not SRD 5.2.1 complete.** S01 identifies the gaps; S02 owns attributable corrections and S03 owns the validated offline bundle. No raw data has been patched.

## Baseline and method

The [official SRD page](https://www.dndbeyond.com/srd) links both [5.2](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.pdf) and [5.2.1](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf). The [publisher's May 1, 2025 patch notes](https://www.dndbeyond.com/community-update) enumerate the version delta. Every published change is dispositioned below. PDF extraction and visual checks of legal information and the affected creature pages corroborate the comparison. PDF hashes are in `audit-sources.json`; local audit copies/renderings are under ignored `.cache/s01/` and are not application assets.

`parity-audit.json` reproducibly checks the raw item names, creature identities and sampled values. Presence is not semantic equivalence. This is a patch-delta audit and bounded transcription check, not a word-for-word certification of the entire SRD. A02 must enumerate source coverage/exclusions, and S02 must diagnose/validate every mapping before S03 can claim a baseline-complete bundle.

## Every published 5.2-to-5.2.1 change

The following added items have **no matching Item or MagicItem row**, using case-insensitive exact-name matching across both files (including variants):

| Added item | Disposition |
| --- | --- |
| Bead of Nourishment | Missing; S02 addition required |
| Cloak of Invisibility | Missing; S02 addition required |
| Elixir of Health | Missing; S02 addition required |
| Energy Bow | Missing; S02 addition required |
| Gloves of Thievery | Missing; S02 addition required |
| Hat of Many Spells | Missing; S02 addition required |
| Potion of Invulnerability | Missing; S02 addition required |
| Potion of Longevity | Missing; S02 addition required |
| Potion of Vitality | Missing; S02 addition required |
| Quarterstaff of the Acrobat | Missing; S02 addition required |
| Rod of Resurrection | Missing; S02 addition required |
| Sending Stones | Missing; S02 addition required |
| Sentinel Shield | Missing; S02 addition required |
| Shield of the Cavalier | Missing; S02 addition required |
| Thunderous Greatclub | Missing; S02 addition required |

Other published changes:

- Duplicate Iron Golem replaced with Knight: source contains exactly one Knight and one Iron Golem identity, with separate action rows. Identity-level correction is present; field issues remain below.
- Octopus added: exactly one Octopus identity exists with traits/actions. Presence is satisfied; its fields are incorrect below.
- Legal-text spacing and page-number changes: PDF presentation changes have no fixture equivalent. Preserve the official attribution; upstream JSON has no corresponding pagination to update.

## Concrete correction requirements from spot checks

The official 5.2.1 stat blocks on printed pages 302 and 357–358 were visually checked. `parity-audit.json` records exact raw/expected values and page locations.

| Upstream identity | Field | Raw | Expected | S02 action |
| --- | --- | --- | --- | --- |
| `srd-2024_octopus` | `ability_score_constitution` | 0 | 11 | Correct score, not modifier |
| `srd-2024_octopus` | `ability_score_charisma` | -3 | 4 | Correct score, not modifier |
| `srd-2024_octopus` | `saving_throw_constitution` | 30 | 0 | Correct table-column transcription |
| `srd-2024_knight` | `condition_immunities` | empty | frightened | Retain missing immunity |
| `srd-2024_iron-golem` | `ability_score_strength` | 24 | 24 | Matches; retain unchanged |

Knight allows Medium or Small; the source stores only `small`. S02 needs a diagnostic/representation for that choice, rather than implying the single size fully describes the source. The five checks above find four discrepancies and one matching value; they do not certify the remaining stat fields. A numeric scan finds two ability scores outside 1–30, both on Octopus. Plausible-range transcription errors still require source comparison.

## Provenance and category gaps

- `Document.json` calls this System Reference Document 5.2, identifies `srd-2024`, `5e-2024`, and `cc-by-40`, and gives publication date `2024-01-01T00:00:00`. That date is not reliable evidence of the SRD release (official 5.2/5.2.1 dates are April 22/May 1, 2025). Preserve it as upstream metadata, separately from retrieval/baseline dates.
- 24 class rows comprise 12 classes and 12 subclasses; 1,812 ClassFeatureItem rows include level/table children. 760 MagicItem rows include variants. These numbers cannot be presented as unique printed features/items or executable coverage.
- The 56 Rule and 11 RuleSet rows cover selected playing/creation sections. They do not establish full Rules Glossary, Gameplay Toolbox, crafting, treasure-table or prose coverage. There is no selected standalone glossary/toolbox fixture. Condition descriptions are separately present (15 rows). A02 must compare the actual category inventory with the official contents and record every required missing category/entry; no completeness inference from filenames/counts is permitted.
- Shared `core` lookup metadata identifies `5e-2014`; it supplies foreign-key identities and must not override 2024 descriptions. Three game-system metadata rows and three license rows are retained whole; they are not imported content catalogs.
- All 15,641 typed/generic references resolve, excluding 15 deliberately unacquired image links. This checks database relationships, not prose cross-links or game semantics. Ninety ContentType natural keys are interpreted for the 45 generic cross-reference rows; no Django database is loaded.
- 46 source costs are fractional gold. Raw decimal strings are preserved. S02 must diagnose the valuation boundary and cannot round or invent priced bundles (A05 requires explicit whole-gold authored valuations).

## Required downstream gate

S01 acquisition/audit is deliverable with these explicit gaps. S02 must preserve stable correction provenance against this SHA, add the missing patch content from the licensed official baseline, validate erroneous fields and audit category coverage with A02. S03 must fail baseline-completeness validation until those requirements are resolved. Acquisition, normalized data, executable mechanics and tested mechanics remain separate completion states.
