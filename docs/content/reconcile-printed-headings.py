"""Reconcile printed SRD headings with pinned identities. Requires pypdf."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata

from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
SOURCE = "data/v2/wizards-of-the-coast/srd-2024/"
BOOK_HASH = "8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87"
PAGES = {
    "spell": (107, 175),
    "glossary": (176, 191),
    "magic-item": (209, 253),
    "toolbox-entry": (194, 201),
    "class-feature": (28, 82),
    "equipment-description": (93, 100),
}
ITEM_CATEGORY = re.compile(r"^(Armor|Potion|Ring|Rod|Scroll|Staff|Wand|Weapon|Wondrous Item)\b")
MAGIC_FAMILIES = {
    "Ammunition, +1, +2, or +3": r"Ammunition \(\+[123]\)",
    "Ammunition of Slaying": r"Ammunition of .+ Slaying",
    "Armor, +1, +2, or +3": r".+ \(\+[123]\)",
    "Berserker Axe": r"Berserker .+",
    "Dancing Sword": r"Dancing .+",
    "Demon Armor": r"Demon .+",
    "Dwarven Plate": r"Dwarven Half Plate",
    "Plate Armor of Etherealness": r"Half Plate Armor of Etherealness",
    "Potions of Healing": r"Potion of .*(?:Healing|heal)",
    "Shield, +1, +2, or +3": r"Shield \(\+[123]\)|Shield \+[123]",
    "Sword of Life Stealing": r".+ of Life Stealing",
    "Sword of Sharpness": r".+ of Sharpness",
    "Sword of Wounding": r".+ of Wounding",
    "Vicious Weapon": r"Vicious .+",
    "Vorpal Sword": r"Vorpal .+",
    "Wand of the War Mage, +1, +2, or +3": r"Wand of the War Mage .+",
    "Weapon, +1, +2, or +3": r".+ \(\+[123]\)",
}
# These named families use a parenthesized variant or an appended base item.
PREFIX_FAMILIES = {
    "Adamantine Armor", "Armor of Resistance", "Armor of Vulnerability",
    "Belt of Giant Strength", "Defender", "Holy Avenger",
    "Elven Chain", "Feather Token", "Figurine of Wondrous Power", "Flame Tongue",
    "Frost Brand", "Giant Slayer", "Hammer of Thunderbolts", "Ioun Stone",
    "Luck Blade", "Mithral Armor", "Nine Lives Stealer", "Oathbow",
    "Potion of Giant Strength", "Spell Scroll", "Weapon of Warning",
}
TOOLBOX_ENTRIES = {
    194: {"cacklefever", "sewerplague", "sightrot"},
    195: {"deepwater", "extremecold", "extremeheat", "frigidwater", "heavyprecipitation",
          "highaltitude", "slipperyice", "strongwind", "thinice"},
    199: {"collapsingroof", "fallingnet", "firecastingstatue"},
    200: {"hiddenpit", "poisoneddarts", "poisonedneedle"},
    201: {"rollingstone", "spikedpit"},
}
RANGED_WEAPONS = {
    "blowgun", "dart", "hand-crossbow", "heavy-crossbow", "light-crossbow",
    "longbow", "musket", "pistol", "shortbow", "sling",
}
WEAPON_FAMILY_CHOICES = {
    "Berserker Axe": {"battleaxe", "greataxe", "halberd"},
    "Dancing Sword": {"greatsword", "longsword", "rapier", "scimitar", "shortsword"},
    "Frost Brand": {"glaive", "greatsword", "longsword", "rapier", "scimitar", "shortsword"},
    "Hammer of Thunderbolts": {"maul", "warhammer"},
    "Luck Blade": {"glaive", "greatsword", "longsword", "rapier", "scimitar", "sickle", "shortsword"},
    "Oathbow": {"longbow", "shortbow"},
    "Sword of Life Stealing": {"glaive", "greatsword", "longsword", "rapier", "scimitar", "shortsword"},
    "Sword of Sharpness": {"glaive", "greatsword", "longsword", "scimitar"},
    "Sword of Wounding": {"glaive", "greatsword", "longsword", "rapier", "scimitar", "shortsword"},
    "Vorpal Sword": {"glaive", "greatsword", "longsword", "scimitar"},
}
SLOT_SUFFIXES = ["slots-" + ordinal for ordinal in
                 ("1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th")]
CLASS_TABLES = {
    "barbarian": (28, ["rages", "rage-damage", "weapon-mastery-count"]),
    "bard": (31, ["bardic-die", "cantrips", "prepared-spells"] + SLOT_SUFFIXES),
    "cleric": (36, ["channel-divinity-uses", "cantrips", "prepared-spells"] + SLOT_SUFFIXES),
    "druid": (41, ["wild-shape-uses", "cantrips", "prepared-spells"] + SLOT_SUFFIXES),
    "fighter": (47, ["second-wind-uses", "weapon-mastery-count"]),
    "monk": (50, ["martial-arts-dice", "focus-points", "unarmored-movement"]),
    "paladin": (53, ["channel-divinity-uses", "prepared-spells"] + SLOT_SUFFIXES[:5]),
    "ranger": (58, ["favored-enemy-uses", "prepared-spells"] + SLOT_SUFFIXES[:5]),
    "rogue": (62, ["sneak-attack-column-data"]),
    "sorcerer": (65, ["sorcery-points", "cantrips", "prepared-spells"] + SLOT_SUFFIXES),
    "warlock": (71, ["eldritch-invocation-count", "cantrips", "prepared-spells",
                     "spell-slots", "slot-level"]),
    "wizard": (77, ["cantrips", "prepared-spells"] + SLOT_SUFFIXES),
}


def normalized(name):
    text = unicodedata.normalize("NFKC", name).casefold()
    return "".join(char for char in text if char.isalnum())


def page_fragments(page):
    fragments = []

    def visit(text, _cm, matrix, font, _size):
        if text.strip() and font:
            fragments.append((" ".join(text.split()), str(font["/BaseFont"]), matrix[0],
                              matrix[4], matrix[5]))

    page.extract_text(visitor_text=visit)
    return fragments


def printed_headings(book, category):
    if category == "creature":
        for number in range(2, 5):
            text = book.pages[number - 1].extract_text()
            for name, target in re.findall(r"(?m)^(.+?)\s*\.{4,}\s*(\d+)\s*$", text):
                if int(target) >= 258 and name.strip() != "Animals" and not name.startswith("Monsters A"):
                    yield name.strip(), int(target)
        if "\nGiant Fly\n" not in book.pages[221].extract_text():
            raise ValueError("The embedded Giant Fly stat block could not be verified")
        yield "Giant Fly", 222
        return
    start, end = PAGES[category]
    for number in range(start, end + 1):
        parts = page_fragments(book.pages[number - 1])
        for i, (name, font, size, x, y) in enumerate(parts[:-1]):
            next_text, next_font, *_ = parts[i + 1]
            if "GillSans-SemiBold" not in font:
                continue
            if category == "class-feature":
                if re.match(r"Level \d+: ", name):
                    yield name, number
                continue
            if category == "equipment-description":
                priced = re.fullmatch(r"(.+) \([\d,.]+ (?:CP|SP|EP|GP|PP)\)", name)
                if priced:
                    yield priced[1], number
                continue
            if category == "toolbox-entry":
                priced = re.fullmatch(r"(.+) \([\d,]+ GP\)", name)
                if number in (197, 198) and priced:
                    yield priced[1], number
                elif normalized(name) in TOOLBOX_ENTRIES.get(number, set()):
                    yield name, number
                continue
            if category == "spell" and not (
                ("Cambria-Italic" in next_font and re.search(r"^Level [1-9] |Cantrip", next_text))
                or next_text == "Casting Time:"
            ):
                continue
            if category == "magic-item" and not (
                size == 12 and "Cambria-Italic" in next_font and ITEM_CATEGORY.match(next_text)
            ):
                continue
            if category == "glossary" and (
                "Cambria" not in next_font or name.isdecimal()
                or name in {"Rules Glossary", "Glossary Conventions", "Rules Definitions"}
            ):
                continue
            if category == "magic-item" and i:
                previous, previous_font, previous_size, px, py = parts[i - 1]
                if previous_font == font and previous_size == size and abs(px - x) < .1 and 9 < py - y < 15:
                    name = previous + " " + name
            yield name, number


def candidates(category, name, records):
    key = normalized(name)
    if category == "glossary":
        key = normalized(re.sub(r"\s*\[[^]]+\]$", "", name))
    if category == "class-feature":
        key = normalized(re.sub(r"^Level \d+: ", "", name))
    exact = []
    for record in records:
        source_name = record["fields"].get("name") or record["fields"].get("describes", "")
        if category == "equipment-description":
            source_name = re.sub(r" \([\d,.]+ (?:CP|SP|EP|GP|PP)\)$", "", source_name)
        if normalized(source_name) == key:
            exact.append(record["pk"])
    if category == "magic-item":
        pattern = MAGIC_FAMILIES.get(name)
        if name in PREFIX_FAMILIES:
            pattern = re.escape(name) + r" .+"
        if pattern:
            matches = [record["pk"] for record in records
                       if re.fullmatch(pattern, record["fields"].get("name", ""), re.IGNORECASE)
                       and matches_family(name, record["fields"])]
            if matches:
                return "variant-candidates", sorted(set(exact + matches))
    if exact:
        return "name", sorted(exact)
    return "unmatched-heading", []


def matches_family(name, fields):
    if name == "Armor, +1, +2, or +3":
        return fields.get("armor") not in (None, "srd-2024_shield")
    if name == "Weapon, +1, +2, or +3":
        return bool(fields.get("weapon"))
    if name in {"Defender", "Flame Tongue"}:
        weapon = fields.get("weapon")
        return bool(weapon and weapon.removeprefix("srd-2024_") not in RANGED_WEAPONS)
    if name in WEAPON_FAMILY_CHOICES:
        weapon = fields.get("weapon")
        return bool(weapon and weapon.removeprefix("srd-2024_") in WEAPON_FAMILY_CHOICES[name])
    return True


def reconcile(book, snapshot):
    reports = {}
    for category, tables in {
        "spell": ["Spell"], "creature": ["Creature"], "magic-item": ["MagicItem", "Item"],
        "glossary": ["Rule", "RuleSet", "ConditionDescription"],
        "toolbox-entry": ["Rule", "RuleSet", "Item", "MagicItem"],
        "class-feature": ["ClassFeature"],
        "equipment-description": ["Item", "Armor", "Weapon", "Service"],
    }.items():
        records = [record for table in tables
                   for record in json.loads((snapshot / SOURCE / f"{table}.json").read_bytes())]
        headings = []
        matched = set()
        for name, page in printed_headings(book, category):
            match, ids = candidates(category, name, records)
            headings.append({"heading": name, "page": page, "match": match, "candidateIds": ids})
            matched.update(ids)
        unmatched = [{"id": r["pk"], "name": r["fields"].get("name", r["pk"])}
                     for r in records if category != "toolbox-entry" and r["pk"] not in matched
                     and (category != "magic-item" or r["model"] == "api_v2.magicitem")]
        reports[category] = {"headings": headings, "unusedSourceRows": unmatched}
    return reports


def class_progression_rows(book):
    cases = [json.loads(line) for line in (HERE / "acceptance-cases.jsonl")
             .read_text(encoding="utf-8").splitlines()]
    expected = {case["entries"][0]: case["expectedByLevel"]
                for case in cases if "expectedByLevel" in case}
    output = []
    for name, (page, suffixes) in CLASS_TABLES.items():
        entries = ["srd-2024_" + name + "_" + suffix
                   for suffix in ["proficiency-bonus"] + suffixes]
        levels = set()
        for line in book.pages[page - 1].extract_text(extraction_mode="layout").splitlines():
            match = re.match(r"^\s*(\d{1,2})\s+(\+[2-6])\s+(.+)$", line)
            if not match:
                continue
            level = int(match[1])
            tokens = re.findall(r"(?<!\w)(?:\d+d\d+|D\d+|\+?\d+|[—–−])(?!\w)",
                                match[3])
            tail = tokens[-len(suffixes):]
            observed = [int(match[2])]
            for token in tail:
                if token in "—–−":
                    value = 0
                elif "d" in token.lower():
                    value = token.lower()
                else:
                    value = int(token)
                observed.append(value)
            required = [expected[entry][level - 1] for entry in entries]
            if observed != required or level in levels:
                raise ValueError(f"Printed class-table mismatch: {name} level {level}: "
                                 f"{observed} != {required}")
            levels.add(level)
            output.append({
                "category": "class-table", "kind": "level", "class": name,
                "page": page, "level": level, "entries": entries, "values": observed,
            })
        if levels != set(range(1, 21)):
            raise ValueError(f"Printed class table is incomplete: {name}")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    if hashlib.sha256(args.pdf.read_bytes()).hexdigest() != BOOK_HASH:
        parser.error("PDF does not match the S01 baseline hash")
    sha = json.loads((HERE / "coverage-summary.json").read_bytes())["sourceCommit"]
    snapshot = HERE.parents[1] / "data/upstream/open5e" / sha
    book = PdfReader(args.pdf)
    reports = reconcile(book, snapshot)
    rows = class_progression_rows(book)
    for category, report in reports.items():
        rows.extend({"category": category, "kind": "heading", **row} for row in report["headings"])
        rows.extend({"category": category, "kind": "unused-source", **row}
                    for row in report["unusedSourceRows"])
    output = "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows)
    destination = HERE / "printed-heading-reconciliation.jsonl"
    if args.write:
        destination.write_text(output, encoding="utf-8", newline="\n")
    elif output != destination.read_text(encoding="utf-8"):
        parser.error("Printed heading reconciliation is stale")
    for category, report in reports.items():
        misses = [row for row in report["headings"] if not row["candidateIds"]]
        print(f"{category}: {len(report['headings'])} headings, "
              f"{len(misses)} unmatched, {len(report['unusedSourceRows'])} unused source rows")
        if category == "magic-item":
            print(", ".join(row["heading"] for row in misses))


if __name__ == "__main__":
    main()
