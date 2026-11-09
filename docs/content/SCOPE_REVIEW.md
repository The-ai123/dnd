# A02B scope review

Reviewed November 9, 2026 against the approved A01 boundary in PROJECT_PLAN.md and ARCHITECTURE.md. The versioned policy is coverage-policy.json. The scope applies to mechanical execution, while retained source text and character grants remain visible.

## Required simulation and descriptive effects

A fully deferred entry requires an unsupported lighting field or special sense to deliver its defined behavior. A mandatory light radius, magical Darkness interaction, or granted Darkvision/Blindsight/Truesight/Tremorsense is a dependency. A rule exception that directly changes an attack, perceived text or terrain according to a special sense also needs that capability.

Ordinary visibility, the Invisible and Blinded conditions, walls, doors, radius, physical obscurement, creature-type detection and storyteller-supplied off-map facts use the enabled rules and projection primitives. A spell's name, a bright-looking effect, or the word "sense" does not by itself establish an unsupported capability.

Clairvoyance and Scrying create remote sources of ordinary sight/hearing. Their luminous-orb descriptions specify the sensor's appearance when it can be seen. They define no illumination radius and grant no special sense. Both are enabled. Blur, Mirror Image, Illusory Script and Mirage Arcane explicitly depend on special-sense exceptions for their mechanical or per-viewer outcomes and remain deferred. Faithful Hound uses Truesight to determine what it can perceive, so it is deferred.

Igniting or extinguishing an eligible physical object records its fire state. Fire Bolt, Druidcraft, Prestidigitation, Elementalism and Create or Destroy Water can resolve those effects without inventing a lighting radius. Explicit brightness changes from Thaumaturgy are an unavailable branch. Spells with mandatory emitted light or magical lighting behavior retain their full deferral where the behavior cannot be isolated.

## Selectable branches and grants

A definition is independently selectable when the source supplies an effect choice, a separate action, or a distinct grant. Disable the whole affected choice before execution and preserve other supported choices.

- Find Familiar keeps summoning, telepathic conversation, touch delivery and ordinary familiar actions. Its remote-perception Bonus Action also grants the familiar's special senses, so that subaction is unavailable as a whole.
- Private Sanctum's vision-blocking security property includes Darkvision. That property is unavailable. Its separately selectable sound, Divination, teleport and planar-travel security properties retain their complete rules.
- Hallow's Darkness and Daylight choices and Tiny Hut's interior lighting command are unavailable. The rest of each definition retains its own complete behavior.
- Drow lineage's extended Darkvision, Dancing Lights, Faerie Fire and Darkness grants and Infernal legacy's Darkness grant retain their identities but cannot execute. Other lineage benefits remain available.
- Warlock Devil's Sight, Gaze of Two Minds, One with Shadows and Witch Sight have unavailable required capabilities. Visions of Distant Realms is also unavailable because it grants Arcane Eye. The invocation case table covers all 28 named options.
- Choosing a spell through Magical Secrets, Magic Initiate, Pact of the Tome, Wish or another proxy never bypasses that spell's availability. A mandatory grant remains recorded. An elective choice can offer a supported alternative without silently substituting one.

Keep general creature/preset sense metadata and shape-changing grants with provenance. Label each unsupported sense component unavailable. A creature or form can retain its supported movement, defenses and actions. A distinct action requiring the deferred sense must expose that dependency. D01/S02 must retain component availability, and F05 must enforce it.

## Disclosure and enforcement

Record acknowledgment for each character and granted definition revision, including mandatory grants that cannot execute. A scope or grant-version change requires acknowledgment again. Creation and leveling remain valid after acknowledgment, and supported features remain usable.

Unavailable content does not create resolution state, spend resources or consume an action. Enabled actions with exhausted allowances warn and permit execution under A01, tracking excess spending separately from the zero usable balance.

The policy's 40 fully deferred identities are enumerated exactly in coverage-policy.json and coverage-catalog.jsonl. Each has an acceptance case for disclosure, persistence, rejected execution and version changes. Every named unavailable branch is subject to the same contract. F05 must verify propagation against normalized definitions and its trusted handler registry.
