"""Generate or verify the A02 planning catalog from the pinned S01 evidence."""
import argparse
from collections import Counter, defaultdict
import csv
import hashlib
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


def entry_fixtures(entries, filename, source, level=None, complete=True):
    with (HERE / filename).open(encoding="utf-8", newline="") as stream:
        reader = csv.DictReader(stream, delimiter="|")
        if reader.fieldnames != ["id", "setup", "act", "expect"]:
            raise ValueError(f"Invalid fixture columns: {filename}")
        fixtures = list(reader)
    expected = {
        entry["id"] for entry in entries
        if entry["source"] == source and entry["scope"] == "enabled"
        and (level is None or entry["sourceInputs"]["level"] == level)
    }
    actual = Counter("srd-2024_" + case["id"] for case in fixtures)
    if not actual.keys() <= expected or any(count != 1 for count in actual.values()):
        raise ValueError(f"{filename} has unknown or duplicate {source} entries")
    if complete and actual != Counter(expected):
        raise ValueError(f"{filename} must cover each eligible {source} entry once")
    for case in fixtures:
        if None in case:
            raise ValueError(f"Unexpected fixture fields in {filename}: {case['id']}")
        entry_id = "srd-2024_" + case["id"]
        yield {**case, "id": source.removesuffix(".json").lower() + "-" + case["id"],
               "entries": [entry_id]}


def table_fixtures():
    specification = read(HERE / "class-table-expectations.json")
    for suffix, column in specification["columns"].items():
        values = column.get("values")
        if values is None:
            values = specification["patterns"][column["pattern"]]
            if "column" in column:
                values = values[column["column"]]
        if len(values) != 20 or any(not isinstance(value, (str, int)) for value in values):
            raise ValueError(f"Invalid class progression vector: {suffix}")
        yield {
            "id": "class-table-" + suffix,
            "entries": ["srd-2024_" + suffix],
            "setup": "Pin legal choices and no explicit overrides. Build this class at each level 1–20.",
            "act": "Compare direct creation and incremental advancement, then respec down and rebuild.",
            "expect": "The selected column equals expectedByLevel for each level. Rebuild preserves "
                      "provenance and does not duplicate grants. Spell slots in multiclass characters "
                      "use the separate multiclass-slot rules, not addition of these mono-class columns.",
            "basis": column["basis"],
            "expectedByLevel": values,
            "sourcePages": specification["provenance"],
        }


def choice_fixtures(filename, parent, source_records):
    with (HERE / filename).open(encoding="utf-8", newline="") as stream:
        reader = csv.DictReader(stream, delimiter="|")
        if reader.fieldnames != ["id", "setup", "act", "expect"]:
            raise ValueError(f"Invalid choice fixture columns: {filename}")
        cases = list(reader)
    description = source_records[parent]["fields"]["desc"]
    expected = {name.strip("*") for name in re.findall(r"(?m)^### (.+)$", description)}
    if parent == "srd-2024_sorcerer_metamagic-options":
        # The snapshot lost this heading marker. The independent printed review records it.
        expected.add("Subtle Spell")
    if {case["id"] for case in cases} != expected:
        raise ValueError(f"{filename} must cover every named source option")
    for case in cases:
        if None in case:
            raise ValueError(f"Unexpected choice fixture fields in {filename}: {case['id']}")
        title = case["id"]
        if title not in description:
            raise ValueError(f"Unknown choice {title} in {parent}")
        yield {
            **case, "id": parent + "-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"),
            "entries": [parent], "branch": title,
        }


def source_diagnostics(entries, fixtures, source_records):
    by_id = {entry["id"]: entry for entry in entries}
    diagnostics = []
    for case in fixtures:
        if "expectedByLevel" not in case:
            continue
        entry = by_id[case["entries"][0]]
        children = [child for child in entry.get("sourceChildren", []) if child["value"] is not None]
        for level, expected in enumerate(case["expectedByLevel"], 1):
            values = [child for child in children if child["level"] == level]
            if len(values) > 1:
                diagnostics.append({
                    "id": entry["id"] + "-duplicate-level-" + str(level),
                    "entry": entry["id"], "level": level, "kind": "duplicate-table-level",
                    "children": [child["id"] for child in values], "owner": "S02",
                })
            observed = values[0]["value"].lower() if values else "0"
            if isinstance(expected, int):
                number = re.fullmatch(r"\+?(\d+)(?:st|nd|rd|th| ft\.)?", observed)
                observed = int(number[1]) if number else observed
            if observed != expected:
                diagnostics.append({
                    "id": entry["id"] + "-table-value-" + str(level),
                    "entry": entry["id"], "level": level, "kind": "table-value",
                    "observed": observed, "expected": expected, "owner": "S02",
                })
    for finding in read(HERE / "reviewed-source-findings.json"):
        observed = source_records[finding["entry"]]["fields"][finding["field"]]
        if hashlib.sha256(observed.encode("utf-8")).hexdigest() != finding["observedSha256"]:
            raise ValueError(f"Source review is stale: {finding['id']}")
        diagnostics.append(finding)
    return diagnostics


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
                "handlerCoverageUnit": record["model"] + ":" + str(pk),
                "sourceRuleField": "desc",
                "dataStatus": "raw-pinned",
                "mechanicsStatus": "deferred" if reason else "required",
                "acceptanceStatus": "specified",
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
    fixtures.extend(read(HERE / "class-common-fixtures.json"))
    fixtures.extend(entry_fixtures(output, "cantrip-fixtures.txt", "Spell.json", 0))
    fixtures.extend(entry_fixtures(output, "level-one-spell-fixtures.txt", "Spell.json", 1))
    fixtures.extend(entry_fixtures(output, "level-two-spell-fixtures.txt", "Spell.json", 2))
    fixtures.extend(entry_fixtures(output, "level-three-spell-fixtures.txt", "Spell.json", 3))
    fixtures.extend(entry_fixtures(output, "level-four-spell-fixtures.txt", "Spell.json", 4))
    fixtures.extend(entry_fixtures(output, "level-five-spell-fixtures.txt", "Spell.json", 5))
    fixtures.extend(entry_fixtures(output, "level-six-spell-fixtures.txt", "Spell.json", 6))
    fixtures.extend(entry_fixtures(output, "level-seven-spell-fixtures.txt", "Spell.json", 7))
    fixtures.extend(entry_fixtures(output, "level-eight-spell-fixtures.txt", "Spell.json", 8))
    fixtures.extend(entry_fixtures(output, "level-nine-spell-fixtures.txt", "Spell.json", 9))
    fixtures.extend(entry_fixtures(output, "species-trait-fixtures.txt", "SpeciesTrait.json"))
    fixtures.extend(entry_fixtures(output, "feat-benefit-fixtures.txt", "FeatBenefit.json"))
    fixtures.extend(table_fixtures())
    fixtures.extend(entry_fixtures(output, "class-feature-fixtures.txt", "ClassFeature.json",
                                  complete=False))
    feature_records = {row["pk"]: row for row in rows["ClassFeature"]}
    fixtures.extend(choice_fixtures("metamagic-choice-fixtures.txt",
                                   "srd-2024_sorcerer_metamagic-options", feature_records))
    fixtures.extend(choice_fixtures("invocation-choice-fixtures.txt",
                                   "srd-2024_warlock_eldritch-invocation-options", feature_records))
    for entry in output:
        for branch, dependency in entry.get("unavailableBranches", {}).items():
            fixtures.append({
                "id": "unavailable-branch-" + entry["id"] + "-"
                      + re.sub(r"[^a-z0-9]+", "-", branch.lower()).strip("-"),
                "entries": [entry["id"]], "branch": branch,
                "setup": "This definition has the named " + dependency + "-dependent branch.",
                "act": "Select that branch, reload the selection, and try to execute it.",
                "expect": "Show and persist the unavailable reason and required grant acknowledgment. "
                          "Create no effect, resource charge or pending resolution. Other independently "
                          "selectable supported branches remain usable without substitution.",
            })
        if entry["scope"] == "deferred":
            fixtures.append({
                "id": "unavailable-" + entry["id"], "entries": [entry["id"]],
                "setup": "Grant this exact definition version to a character with no acknowledgment.",
                "act": "Review and acknowledge, reload, attempt execution, then change grant version.",
                "expect": "Show the recorded dependency reason and retain character validity and other "
                          "supported grants. Persist acknowledgment by character/definition version. "
                          "Execution creates no mechanics, action/resource use or pending resolution. "
                          "Changed scope/version requires acknowledgment again.",
            })
    known_entries = {entry["id"]: entry for entry in output}
    if len(known_entries) != len(output):
        raise ValueError("Coverage IDs collide across upstream models")
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
    indexed["enabledEntriesWithConcreteFixtures"] = sum(
        row["scope"] == "enabled" and "concreteFixtureIds" in row for row in output
    )
    missing = [row["id"] for row in output if "concreteFixtureIds" not in row]
    if missing:
        raise ValueError(f"Entries without a concrete acceptance case: {missing}")
    diagnostics = source_diagnostics(output, fixtures, feature_records)
    for entry in output:
        entry["sourceCorrectionIds"] = [
            finding["id"]
            for finding in diagnostics if finding["entry"] == entry["id"]
        ]
    indexed["sourceCorrectionDiagnostics"] = len(diagnostics)
    return indexed, output, fixtures, diagnostics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="refresh the checked-in catalog")
    args = parser.parse_args()
    summary, rows, fixtures, diagnostics = build()
    outputs = {
        "coverage-summary.json": json.dumps(summary, indent=2) + "\n",
        "coverage-catalog.jsonl": "".join(
            json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows
        ),
        "acceptance-cases.jsonl": "".join(
            json.dumps(case, ensure_ascii=False, separators=(",", ":")) + "\n"
            for case in fixtures
        ),
        "coverage-source-diagnostics.json": json.dumps(diagnostics, indent=2) + "\n",
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
