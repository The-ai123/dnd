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
| Rules Glossary, pp. 176–191 | No standalone glossary catalog. The [printed glossary index](glossary-headings.json) enumerates the definitions requiring reconciliation. Match overlaps such as conditions, damage and ability checks to reviewed definitions and add the missing entries with printed provenance. |
| Gameplay Toolbox, pp. 192–203 | No standalone toolbox catalog. Reconcile travel pace, creating a background, curses and magical contagions, environmental effects, fear and mental stress, poison, traps and combat encounters. Check overlaps in Rule, Item and Service before creating a record. |
| Magic Items, pp. 204–253 | 760 rows include equipment/variant expansions. Reconcile printed parent items and variants, including the 15 missing 5.2.1 additions in the patch audit. Map rarity, categories, activation, next-dawn resets, cursed items, resilience, crafting and sentient-item prose. Printed title matching requires parent/variant aliases (for example, the printed Ammunition bonuses expand to multiple rows). |
| Monsters and Animals, pp. 254–364 | 331 creature rows with action, attack and trait children. All 330 printed stat-block index names matched after punctuation normalization. Giant Fly is the sole extra source name relative to that index, and needs reconciliation against the embedded item stat block. Reconcile printed stat blocks, creature type and variants independently of imported senses and artwork. Known corrections include Knight and Octopus. Compare monster instructions and any embedded stat blocks and lair behavior as well as the creature rows. |

The pinned [record index](record-index.json) enumerates the complete raw identities, including every support and shared-lookup row. [The reference audit](reference-audit.json) identifies the 15 intentionally excluded image links and typed-reference evidence. An S02 report must diagnose required missing definitions, malformed or ambiguous fields, prose links, and structured-to-printed discrepancies. S03 must require resolved baseline coverage before shipping. Chapter comparison and name matching do not certify semantic parity or exhaustively reconcile printed variants.

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

An executable F05 case must pin deterministic input state, rolls and expected results independently of the handler. Run each mechanically distinct route, including rejection, success and expiry where applicable. [Concrete acceptance examples](coverage-fixtures.json) cover progression, deferred grants, casting and action resolution. The matrix’s shared contracts specify the rest of the test obligations. Concrete independent outcome vectors for every enabled entry still need to be authored as part of entry-by-entry review. S02 must preserve printed cross-dependencies for that review.

## Scope and propagation

Enabled entries may ask for storyteller judgment or off-map facts. Once supplied, the resolution owns mechanical bookkeeping. Basic visibility, ordinary obscurement from area effects, the Invisible and Blinded conditions, and rules tied to sight are in scope. Lighting-dependent checks and special-sense simulation are deferred. A descriptive reference to an unseen object or a spell list containing a deferred spell does not by itself disable an entry.

[The policy](coverage-policy.json) names the fully deferred entries and isolated unavailable branches. Entries with required lighting/sense behavior that cannot be isolated are fully unavailable. Independently selectable effects or grants carry their own availability. If a feature offers a choice to cast an unavailable spell, disable that path while keeping unrelated choices and grants available. A mandatory deferred grant is recorded and acknowledged while the character remains valid. Acknowledgment is tied to character and grant definition revision, and a scope change requires it again. A disallowed activation never mutates resources, geometry or turn state.

The scope decisions for mixed effects are interpretations of the A01 policy. Review these with A05 before using them to lock editor choices. If an individual effect has ambiguous dependencies, record the ambiguity and leave the release gate open. This also applies to printed prose variants and monster/item interactions that are outside the feature/spell matrix.

## Handoff status

The inventory, proposed exclusions and shared fixture contracts are available for downstream review. A02 still needs independent entry-by-entry expected outcomes and a full review of printed category and variant gaps. The coordinator can link this evidence from the shared board when integrating the branch.

## Reproduce and hand off

Run `python docs/content/audit-snapshot.py` followed by `python docs/content/catalog-coverage.py`. Use `--write` only to regenerate and review planning evidence. No upstream access is needed.

- **S02/S03** Consume all S01 identities, apply attributable corrections, resolve dependencies and close parity diagnostics before packaging.
- **A05/F04** Expose unavailable grants and option branches in the typed editors and progression ledger. Run the level-by-level, direct creation, multiclass and rebuild cases with the reviewed tables.
- **F05** Assign trusted handler IDs and independent concrete fixtures to each enabled record and branch. Track mapped, implemented and passing as separate milestones.
