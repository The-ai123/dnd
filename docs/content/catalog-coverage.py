"""Generate or verify the A02 planning catalog from the pinned S01 evidence."""
import argparse
from collections import Counter, defaultdict
import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SHA = "e69ac13b49dae6a9d84abf38fc674fe1db5b392b"
SOURCE = "data/v2/wizards-of-the-coast/srd-2024/"
SNAPSHOT = ROOT / "data/upstream/open5e" / SHA
FEATURES = {
    "ClassFeature": "class-feature",
    "SpeciesTrait": "species-trait",
    "FeatBenefit": "feat-benefit",
    "BackgroundBenefit": "background-grant",
    "WeaponProperty": "weapon-property",
    "Spell": "spell",
}
SPELL_FIELDS = (
    "level", "casting_time", "reaction_condition", "range_text", "target_type",
    "target_count", "shape_type", "shape_size", "shape_size_unit", "attack_roll",
    "saving_throw_ability", "damage_roll", "damage_types", "duration",
    "concentration", "ritual", "verbal", "somatic", "material",
    "material_specified", "material_cost", "material_consumed", "classes",
)


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def row_key(record):
    return record["model"], record["pk"]


def spell_fixtures(entries, filename, level):
    with (HERE / filename).open(encoding="utf-8", newline="") as source:
        fixtures = list(csv.DictReader(source, delimiter="|"))
    expected = {
        entry["id"] for entry in entries
        if entry["source"] == "Spell.json" and entry["scope"] == "enabled"
        and entry["sourceInputs"]["level"] == level
    }
    actual = Counter("srd-2024_" + case["id"] for case in fixtures)
    if actual != Counter(expected):
        raise ValueError(f"{filename} must cover each enabled level-{level} spell once")
    for case in fixtures:
        entry_id = "srd-2024_" + case["id"]
        yield {**case, "id": "spell-" + case["id"], "entries": [entry_id]}


def build():
    manifest = read(SNAPSHOT / "manifest.json")
    if manifest["commit"] != SHA:
        raise ValueError("A02 requires the pinned S01 source commit")
    policy = read(HERE / "coverage-policy.json")
    index = read(HERE / "record-index.json")
    source_paths = sorted({row["file"] for row in index if row["file"].startswith(SOURCE)})
    rows = {
        Path(path).stem: read(SNAPSHOT / path)
        for path in source_paths
    }
    expected = Counter(row_key(row) for row in index if row["file"].startswith(SOURCE))
    actual = Counter(row_key(row) for records in rows.values() for row in records)
    if actual != expected or any(count != 1 for count in actual.values()):
        raise ValueError("A02 identities disagree with the S01 record index")

    deferred = {}
    for reason, groups in policy["deferred"].items():
        for name, keys in groups.items():
            known = {record["pk"] for record in rows[name]}
            for suffix in keys.split():
                identity = name, "srd-2024_" + suffix
                if identity in deferred or identity[1] not in known or name not in FEATURES:
                    raise ValueError(f"Invalid deferred identity: {identity}")
                deferred[identity] = reason
    branches = policy["deferredBranches"]
    if not branches.keys() <= {row["pk"] for name in FEATURES for row in rows[name]}:
        raise ValueError("A deferred branch refers to an unknown feature or spell")

    children = defaultdict(list)
    for table in ("ClassFeatureItem", "SpellCastingOption"):
        for record in rows[table]:
            fields = record["fields"]
            child = {"id": record["pk"]}
            if table == "ClassFeatureItem":
                child.update(level=fields.get("level"), value=fields.get("column_value"),
                             detail=fields.get("detail"))
            else:
                child["type"] = fields["type"]
            children[fields["parent"]].append(child)
    option_owners = {
        record["pk"]: record["fields"]
        for table in ("CharacterClass", "Feat", "Background", "Species")
        for record in rows[table]
    }
    output = []
    for table, role in FEATURES.items():
        for record in rows[table]:
            pk = record["pk"]
            fields = record["fields"]
            reason = deferred.get((table, pk))
            case = "unavailable" if reason else role
            if table == "ClassFeature" and (
                "spell-list" in pk or fields["name"] == "Eldritch Invocation Options"
            ):
                case = "class-choice-table"
            entry = {
                "id": pk, "name": fields["name"], "source": table + ".json",
                "scope": "deferred" if reason else "enabled", "fixtureContract": case,
                "handlerRequirement": None if reason else role,
            }
            if reason:
                entry["dependency"] = reason
            if pk in branches:
                entry["unavailableBranches"] = branches[pk]
            if pk in children:
                entry["sourceChildren"] = children[pk]
            if table == "Spell":
                entry["sourceInputs"] = {field: fields.get(field) for field in SPELL_FIELDS}
                entry["higherLevelSourceField"] = bool(fields.get("higher_level"))
            elif fields.get("parent"):
                entry["owner"] = fields["parent"]
                owner = option_owners[fields["parent"]]
                entry["ownerPrerequisite"] = owner.get("prerequisite")
                if owner.get("subclass_of"):
                    entry["baseClass"] = owner["subclass_of"]
            if table == "ClassFeature" and fields["name"] == "Eldritch Invocation Options":
                options = re.split(r"(?m)^### (.+)$", fields["desc"])
                entry["invocations"] = [
                    {"name": title.strip("*"), "prerequisite": next(
                        (line.strip("*") for line in body.splitlines()
                         if line.startswith("*Prerequisite:")), None),
                     "dependency": branches[pk].get(title.strip("*"))}
                    for title, body in zip(options[1::2], options[2::2])
                ]
                if not branches[pk].keys() <= {item["name"] for item in entry["invocations"]}:
                    raise ValueError("Unknown deferred invocation")
            output.append(entry)
    indexed = {
        "sourceCommit": SHA,
        "baseline": "SRD 5.2.1",
        "sourceFileCounts": {table + ".json": len(records) for table, records in rows.items()},
        "indexedRows": sum(actual.values()),
        "coverageRows": len(output),
        "sharedLookupRows": len(index) - sum(actual.values()),
        "scopeCounts": dict(sorted(Counter(row["scope"] for row in output).items())),
        "upstreamManifestVersion": manifest["format"],
    }
    fixtures = read(HERE / "coverage-fixtures.json")
    fixtures.extend(spell_fixtures(output, "cantrip-fixtures.txt", 0))
    fixtures.extend(spell_fixtures(output, "level-one-spell-fixtures.txt", 1))
    fixtures.extend(spell_fixtures(output, "level-two-spell-fixtures.txt", 2))
    fixtures.extend(spell_fixtures(output, "level-three-spell-fixtures.txt", 3))
    known_entries = {entry["id"]: entry for entry in output}
    fixture_ids = set()
    for fixture in fixtures:
        if fixture["id"] in fixture_ids:
            raise ValueError(f"Duplicate fixture: {fixture['id']}")
        fixture_ids.add(fixture["id"])
        for entry_id in fixture.get("entries", []):
            if entry_id not in known_entries:
                raise ValueError(f"Unknown fixture entry: {entry_id}")
            known_entries[entry_id].setdefault("concreteFixtureIds", []).append(fixture["id"])
        if not all(fixture.get(field) for field in ("setup", "act", "expect")):
            raise ValueError(f"Incomplete fixture: {fixture['id']}")
    indexed["concreteFixtures"] = len(fixtures)
    indexed["entriesWithConcreteFixtures"] = sum("concreteFixtureIds" in row for row in output)
    return indexed, output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="refresh the checked-in catalog")
    args = parser.parse_args()
    summary, rows = build()
    outputs = {
        "coverage-summary.json": json.dumps(summary, indent=2) + "\n",
        "coverage-catalog.jsonl": "".join(
            json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows
        ),
    }
    for filename, contents in outputs.items():
        path = HERE / filename
        if args.write:
            path.write_text(contents, encoding="utf-8", newline="\n")
        elif path.read_text(encoding="utf-8") != contents:
            parser.error(f"Stale {filename}. Run with --write and review the diff.")
    print(f"{summary['indexedRows']} source rows, {summary['coverageRows']} coverage entries, "
          f"{summary['scopeCounts']['deferred']} fully deferred")


if __name__ == "__main__":
    main()
