# A02 SRD coverage and acceptance plan

A02 uses the S01 Open5e snapshot at `e69ac13b49dae6a9d84abf38fc674fe1db5b392b`, targeting SRD 5.2.1. See [the source inventory](CONTENT_INVENTORY.md), [attribution](ATTRIBUTION.md), and [the patch and reference audit](SRD_5.2.1_AUDIT.md). These are planning requirements for S02/S03 and F04/F05. S02 records normalization and parity evidence. F05 records executable handler and test evidence independently.

## Catalog and missing source material

| Printed SRD 5.2.1 sections | Pinned evidence and required S02 checks |
| --- | --- |
| Legal information, p. 1 | Carry the reviewed attribution and license alongside the bundle. Preserve the upstream source version independently of the normalized baseline. |
| Playing the Game, pp. 5–18 | 56 Rule rows across the playing and creation sections, 11 RuleSet rows in total, and separate ability, alignment, skill, condition, creature-type and damage-type descriptions. Actions, Bonus Actions and Reactions lack standalone sections in the pinned rules. Map their glossary entries and review source prose cross-references. |
| Character Creation, pp. 19–27 | The creation steps, advancement, multiclassing and trinkets are represented in Rule/RuleSet. Compare score methods, advancement and multiclass tables directly with the printed baseline, including starting at higher levels and default equipment or gold choices. |
| Classes, pp. 28–82 | 12 base classes, 12 subclasses, 352 ClassFeature rows and 1,812 children. Parse feature tables, class spell lists, Metamagic and Eldritch Invocation options from the owning records where they appear in prose. Review each feature level, option prerequisite, number of picks and dependency. A child row can be a table cell or repeated grant. |
| Character Origins and Feats, pp. 83–88 | Four backgrounds, nine species and 17 feats plus their children. Compare origin score, equipment, proficiencies and feat grants, branch-specific lineage and ancestry grants, feat prerequisites and repeatability. |
| Equipment, pp. 89–103 | Items, armor, weapons, weapon properties and assignments, and services are structured. Check coins, armor training, weapon mastery, tool proficiencies and usage, mounts and vehicles, lifestyle and hirelings. Add the missing standalone rules for nonmagical crafting, brewing healing potions and scribing spell scrolls. Keep raw fractional costs and apply the separate authored whole-gold valuation contract. |
| Spells, pp. 104–175 | 339 Spell rows and 682 casting-option children. Printed spell heading comparison found all 339 names with no source-only spell name. Compare field values and text with printed descriptions. Gaining/casting spells and their general rules need explicit mapping as well. |
| Rules Glossary, pp. 176–191 | No standalone glossary catalog. Of 155 printed definition headings, 25 have a name candidate in the selected rule and condition fixtures and 130 have none. Review the latter for embedded equivalents before creating corrections with printed provenance. |
| Gameplay Toolbox, pp. 192–203 | No standalone toolbox catalog. All 34 indexed named examples lack name candidates: 3 contagions, 9 environmental effects, 14 poisons and 8 traps. Reconcile those and the enclosing prose on travel pace, creating a background, curses, fear and mental stress, poison, traps and encounter building. |
| Magic Items, pp. 204–253 | The 258 printed headings match exact names or candidate variants except for the 15 known patch additions. The ten source rows outside these candidate families are ranged Defender variants. The printed Defender requires a melee weapon. Validate each allowed family expansion and map rarity, activation, next-dawn resets, cursed items, resilience, crafting and sentient-item prose. |
| Monsters and Animals, pp. 254–364 | 331 creature rows with action, attack and trait children. All 330 printed stat-block index names matched after punctuation normalization. Giant Fly is the sole extra source name relative to that index, and needs reconciliation against the embedded item stat block. Reconcile printed stat blocks, creature type and variants independently of imported senses and artwork. Known corrections include Knight and Octopus. Compare monster instructions and any embedded stat blocks and lair behavior as well as the creature rows. |

The pinned [record index](record-index.json) enumerates the complete raw identities, including every support and shared-lookup row. [The reference audit](reference-audit.json) identifies the 15 intentionally excluded image links and typed-reference evidence. An S02 report must diagnose required missing definitions, malformed or ambiguous fields, prose links, and structured-to-printed discrepancies. S03 must require resolved baseline coverage before shipping. Chapter comparison and name matching do not certify semantic parity or exhaustively reconcile printed variants.

The [printed-heading reconciliation](printed-heading-reconciliation.jsonl) records pages, candidate source IDs and unused source rows for each audited category. A variant match establishes a candidate family. Verify eligibility, variant count and fields against the printed definition before accepting it.

## Matrix

[Coverage catalog](coverage-catalog.jsonl) has one record for every pinned spell, class feature, species trait, feat benefit, background grant and weapon property. Join on source file and ID, then follow the raw source description, typed references, owner, children, and printed baseline. It is generated from [the policy](coverage-policy.json) and the S01 data. A source field in the matrix can itself need an S02 correction. Entries that are purely option tables require progression and dependency validation as their handler behavior.

| Fixture contract | Required assertions for each entry |
| --- | --- |
| Spell | Resolve cast time, action/reaction trigger, spell source, ability/DC, ritual or slot, component availability/consumption, target/range and geometry, and each distinct effect choice. Assert failure and success branches, exact dice/modifiers, damage/healing/conditions, persistent state, ticks and expiry from the reviewed definition. Expand all printed scaling branches, including cantrip thresholds and upcasts. Include an invalid-input case with no mutation, retry idempotence and whole-action correction. |
| Class feature | Use the owner/base-class and linked level cells. Assert availability just below and at each grant, legal and illegal picks and prerequisites, each repeat-grant or replacement, and one respec with provenance intact. For an invoked/passive effect, assert the trigger, prompt/decision, targets, rolls, resource use/recharge, modifiers, lifecycle and grouped correction from the reviewed definition. |
| Class choice table | Assert the pick count, unlock and prerequisites at each eligible class level, repeatability, and the grant or substitution result. Follow each selected entry and apply its own coverage contract. For a recommendation, validate choice eligibility separately from execution availability. |
| Species trait, feat benefit, background grant | Assert source option eligibility, legal branch choices, starting proficiency/resource/equipment or feature grants, duplicate handling, and effects on the derived sheet. Cover each action/passive trigger using the class-feature resolution assertions. |
| Weapon property | Assert weapon applicability, whether mastery is known and enabled, the attack/weapon conditions and legal targets, exact resource/geometry/modifier effects, and failed conditions leaving other effects intact. |
| Unavailable | Grant or reference remains visible with its dependency reason. Require acknowledgment for a granted feature, track it by character and definition revision, and prevent execution before spending a resource, creating an effect or queueing a prompt. |

An executable F05 case must pin deterministic input state, rolls and expected results independently of the handler. Run each mechanically distinct route, including rejection, success and expiry where applicable. [Concrete acceptance examples](coverage-fixtures.json) cover progression, deferred grants, weapon properties, background grants and action resolution. The [cantrip](cantrip-fixtures.txt), [1st-level](level-one-spell-fixtures.txt), [2nd-level](level-two-spell-fixtures.txt) and [3rd-level](level-three-spell-fixtures.txt) case tables provide at least one concrete case per enabled spell in those slices. Each case links back to its catalog entry. The shared contracts specify additional required routes, and spells of levels 4–9 and most character features still need entry-specific outcome vectors. S02 must preserve printed cross-dependencies for that review.

## Scope and propagation

Enabled entries may ask for storyteller judgment or off-map facts. Once supplied, the resolution owns mechanical bookkeeping. Basic visibility, ordinary obscurement from area effects, the Invisible and Blinded conditions, and rules tied to sight are in scope. Lighting-dependent checks and special-sense simulation are deferred. A descriptive reference to an unseen object or a spell list containing a deferred spell does not by itself disable an entry.

[The policy](coverage-policy.json) names the fully deferred entries and isolated unavailable branches. Entries with required lighting/sense behavior that cannot be isolated are fully unavailable. Independently selectable effects or grants carry their own availability. If a feature offers a choice to cast an unavailable spell, disable that path while keeping unrelated choices and grants available. A mandatory deferred grant is recorded and acknowledged while the character remains valid. Acknowledgment is tied to character and grant definition revision, and a scope change requires it again. A disallowed activation never mutates resources, geometry or turn state.

The scope decisions for mixed effects are interpretations of the A01 policy. Review these with A05 before using them to lock editor choices. If an individual effect has ambiguous dependencies, record the ambiguity and leave the release gate open. This also applies to printed prose variants and monster/item interactions that are outside the feature/spell matrix.

## Handoff status

The user authorized splitting A02 on November 9, 2026. A02A is Complete on this branch. Its verified deliverables are the 6,743-row working inventory, 814-entry feature/spell matrix, proposed availability and dependency policy, printed-heading reconciliation and 202 concrete acceptance cases linked to 209 entries. Every enabled spell through 3rd level, every weapon property and every background grant has at least one case. This supplies source identities, known gaps and representative inputs for adapter and progression foundations.

A02B is To Do and depends on A02A and the completed A05 contract. Its remaining acceptance scope includes the following.

- Reconcile the printed categories, parent/variant eligibility, embedded definitions and missing records, carrying attributable correction requirements into S02 with S02/S03 retaining responsibility for resolving source gaps before baseline-complete packaging.
- Review all proposed lighting/sense exclusions and mixed-effect branches against the approved policy, including grant/dependency propagation and acknowledgment.
- Supply independent expected outcomes for spells of levels 4–9 and the remaining character features, plus the additional mechanically distinct routes for every enabled entry and selectable branch.
- Record exact required handler behavior, prerequisites, progression levels/choices, inputs/rulings/targets, resources, persistent/recurring state, expiry, interactions and grouped undo cases, then cross-check the full catalog and corrected definitions.

A02A's data is sufficient to remove the A02 prerequisite from S02 and F04. Their other prerequisites still apply. S02 still needs B07, and F04 still needs D01 and F02. F05 explicitly requires A02B. S03 retains its S02 dependency and baseline-completeness checks. Parent A02 remains open until both children and integration are complete. The availability policy remains provisional until A02B review, and the source snapshot still requires S02 normalization before becoming an application seed bundle.

## Reproduce and hand off

Run `python docs/content/audit-snapshot.py` followed by `python docs/content/catalog-coverage.py`. Use `--write` only to regenerate and review planning evidence. No upstream access is needed.

With the hash-pinned SRD 5.2.1 PDF from S01 and `pypdf`, run `python docs/content/reconcile-printed-headings.py <path-to-pdf>` to verify the printed comparisons.

- **S02/S03** Consume all S01 identities, apply attributable corrections, resolve dependencies and close parity diagnostics before packaging.
- **A05/F04** Expose unavailable grants and option branches in the typed editors and progression ledger. Run the level-by-level, direct creation, multiclass and rebuild cases with the reviewed tables.
- **F05** Assign trusted handler IDs and independent concrete fixtures to each enabled record and branch. Track mapped, implemented and passing as separate milestones.
