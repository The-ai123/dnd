"""Offline S01 evidence generation/verification. Python 3 stdlib; no app dependency."""
import argparse
import collections
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SHA = "e69ac13b49dae6a9d84abf38fc674fe1db5b392b"
SNAPSHOT = ROOT / "data/upstream/open5e" / SHA
SOURCE = "data/v2/wizards-of-the-coast/srd-2024/"
PATCH_ADDITIONS = ["Bead of Nourishment", "Cloak of Invisibility", "Elixir of Health", "Energy Bow", "Gloves of Thievery", "Hat of Many Spells", "Potion of Invulnerability", "Potion of Longevity", "Potion of Vitality", "Quarterstaff of the Acrobat", "Rod of Resurrection", "Sending Stones", "Sentinel Shield", "Shield of the Cavalier", "Thunderous Greatclub"]


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf8")


def evidence():
    spec = importlib.util.spec_from_file_location("acquire", HERE / "acquire-snapshot.py")
    acquire = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(acquire)
    class LocalSource:
        def read(self, path):
            return (SNAPSHOT / path).read_bytes()
    paths = sorted(p.relative_to(SNAPSHOT).as_posix() for p in SNAPSHOT.rglob("*") if p.is_file() and p.name != "manifest.json")
    schema = acquire.relation_schema({p: p for p in paths}, LocalSource())
    files, records, duplicates, ids = [], {}, [], []
    for path in paths:
        raw = (SNAPSHOT / path).read_bytes()
        role = "srd-2024" if path.startswith(SOURCE) else "schema-evidence" if path.startswith("api_v2/") else "shared-dependency" if path.endswith(".json") else "repository-license-or-readme"
        entry = {"path": path, "role": role, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "git_blob_sha1": hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest(), "url": f"https://raw.githubusercontent.com/open5e/open5e-api/{SHA}/{path}"}
        if path.endswith(".json"):
            fixture = json.loads(raw)
            entry["record_count"] = len(fixture)
            entry["models"] = sorted({r["model"] for r in fixture})
            for r in fixture:
                key = (r["model"], str(r["pk"]))
                if key in records:
                    duplicates.append({"model": key[0], "pk": r["pk"], "files": [records[key][1], path]})
                records[key] = (r, path)
                ids.append({"model": r["model"], "pk": r["pk"], "file": path})
        files.append(entry)
    refs = collections.Counter()
    unresolved, excluded, natural_keys = [], [], 0
    for key, (r, path) in sorted(records.items()):
        for field, relation in schema[r["model"]].items():
            value = r["fields"].get(field)
            if relation["model"] == "api_v2.contenttype":
                natural_keys += value is not None
                continue
            values = value if relation["many"] else [value]
            for pk in values or []:
                if pk is None:
                    continue
                refs[(r["model"], field, relation["model"])] += 1
                target = (relation["model"], str(pk))
                if target not in records:
                    problem = {"file": path, "model": r["model"], "pk": r["pk"], "field": field, "target_model": target[0], "target_pk": pk}
                    (excluded if target[0] == "api_v2.image" else unresolved).append(problem)
        if r["model"] == "api_v2.crossreference":
            for prefix in ["source", "reference"]:
                content_type = r["fields"][prefix + "_content_type"]
                pk = r["fields"][prefix + "_object_key"]
                target_model = ".".join(content_type)
                refs[(r["model"], prefix + "_object_key", target_model)] += 1
                if (target_model, str(pk)) not in records:
                    unresolved.append({"file": path, "model": r["model"], "pk": r["pk"], "field": prefix + "_object_key", "target_model": target_model, "target_pk": pk})
    # Preserve suspect values; this reports encoding damage without correcting it.
    replacement_chars = []
    fractional_prices = []
    from decimal import Decimal
    for (model, pk), (r, path) in sorted(records.items()):
        for field, value in r["fields"].items():
            if isinstance(value, str) and "\ufffd" in value:
                replacement_chars.append({"model": model, "pk": r["pk"], "field": field, "count": value.count("\ufffd")})
        cost = r["fields"].get("cost")
        if cost is not None and Decimal(cost) != Decimal(cost).to_integral_value():
            fractional_prices.append({"model": model, "pk": r["pk"], "cost": cost})
    invalid_scores = [{"model": m, "pk": r["pk"], "field": f, "value": v} for (m, _), (r, _) in sorted(records.items()) if m == "api_v2.creature" for f, v in r["fields"].items() if f.startswith("ability_score_") and not 1 <= v <= 30]
    report = {"duplicates": duplicates, "unresolved_references": unresolved, "excluded_image_references": excluded, "content_type_natural_keys": natural_keys,
              "reference_counts": [{"model": m, "field": f, "target_model": t, "count": c} for (m, f, t), c in sorted(refs.items())],
              "replacement_character_fields": replacement_chars, "fractional_source_prices": fractional_prices, "out_of_range_ability_scores": invalid_scores}
    additions = [{"name": name, "matching_records": [{"model": m, "pk": r["pk"]} for (m, _), (r, path) in sorted(records.items()) if path.startswith(SOURCE) and m in ["api_v2.item", "api_v2.magicitem"] and r["fields"].get("name", "").casefold() == name.casefold()]} for name in PATCH_ADDITIONS]
    checks = []
    for pk, field, expected, page in [("srd-2024_octopus", "ability_score_constitution", 11, 358), ("srd-2024_octopus", "ability_score_charisma", 4, 358), ("srd-2024_octopus", "saving_throw_constitution", 0, 358), ("srd-2024_knight", "condition_immunities", ["frightened"], 302), ("srd-2024_iron-golem", "ability_score_strength", 24, 302)]:
        actual = records[("api_v2.creature", pk)][0]["fields"][field]
        checks.append({"model": "api_v2.creature", "pk": pk, "field": field, "actual": actual, "expected_5_2_1": expected, "pdf_page": page, "status": "matches" if actual == expected else "correction-required"})
    parity = {"baseline": "SRD 5.2.1", "scope": "All May 1, 2025 published patch changes plus explicit stat-block spot checks; not exhaustive transcription certification", "patch_notes_url": "https://www.dndbeyond.com/community-update", "added_magic_items": additions, "creature_patch_presence": {name: sum(r["fields"].get("name") == name for (m, _), (r, _) in records.items() if m == "api_v2.creature") for name in ["Knight", "Octopus", "Iron Golem"]}, "stat_block_checks": checks, "parity_claim": False}
    manifest = {"format": 1, "repository": "https://github.com/open5e/open5e-api", "commit": SHA, "selection_ref": "refs/heads/staging (resolved before acquisition)", "retrieved_date": "2026-10-27", "acquisition": "Published GitHub repository ZIP; selected files copied byte-for-byte; no webpage scraping", "raw_transform_revision": 0, "audit_revision": 1, "source_document": "srd-2024", "source_declared_version": "5.2", "target_baseline": "5.2.1 (see docs/content/SRD_5.2.1_AUDIT.md; parity not claimed)", "files": files}
    lines = ["# Pinned Open5e content inventory", "", f"Commit: `{SHA}`. Generated by `python docs/content/audit-snapshot.py --write`.", "", "Counts are fixture rows, including child/variant rows; they are not counts of automated mechanics or unique printed entries.", "", "| File | Role | Rows |", "| --- | --- | ---: |"]
    for f in files:
        if "record_count" in f:
            lines.append(f"| `{f['path']}` | {f['role']} | {f['record_count']} |")
    totals = collections.Counter()
    for f in files:
        totals[f["role"]] += f.get("record_count", 0)
    lines += ["", f"Raw files: {len(files)}; SRD rows: {totals['srd-2024']}; shared dependency rows: {totals['shared-dependency']}; total rows: {len(ids)}.", "", f"Duplicate model/PK identities: {len(duplicates)}. Unresolved references: {len(unresolved)}. Deliberately excluded image references: {len(excluded)}.", "", f"Fields containing U+FFFD: {len(replacement_chars)}. Fractional source prices: {len(fractional_prices)}. All remain unchanged.", "", "See `record-index.json` for every model/PK/file identity and `reference-audit.json` for field-level reference totals and every diagnosed problem. Integer PKs remain integers in the index. Equal PKs in different models are distinct identities.", "", "Only `srd-2024` is selected rules content. Shared files remain whole for byte preservation, including unused license/game-system metadata. `core` is an upstream 2014-tagged lookup dependency, not approval to mix 2014 mechanics into 2024 rules. Images and their metadata/documents are excluded. Schema Python is audit evidence, never imported or executed by the app.", ""]
    origin = json.loads((HERE / "origin-blobs.json").read_bytes())
    if origin["commit"] != SHA or origin["blobs"] != {f["path"]: f["git_blob_sha1"] for f in files}:
        raise ValueError("Raw file set/bytes do not match pinned origin blob receipt")
    return {SNAPSHOT / "manifest.json": encoded(manifest), HERE / "relations.json": encoded(schema), HERE / "record-index.json": encoded(ids), HERE / "reference-audit.json": encoded(report), HERE / "parity-audit.json": encoded(parity), HERE / "CONTENT_INVENTORY.md": "\n".join(lines).encode("utf8")}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Explicitly regenerate reviewed evidence")
    args = parser.parse_args()
    for path, expected in evidence().items():
        if args.write:
            path.write_bytes(expected)
        elif not path.exists() or path.read_bytes() != expected:
            raise SystemExit(f"FAIL: evidence differs: {path.relative_to(ROOT)}")
    print("PASS: snapshot hashes, exact file set, fixture IDs/counts, schema and reference diagnostics match committed evidence")
