"""Explicit maintenance acquisition only; never invoked by app/build. Python 3 stdlib."""
import io
import argparse
import ast
import hashlib
import json
import pathlib
import urllib.request
import zipfile

SHA = "e69ac13b49dae6a9d84abf38fc674fe1db5b392b"
ROOT = pathlib.Path(__file__).resolve().parents[2]


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Storyteller-S01-audit"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def relation_schema(entries, archive):
    classes = {}
    for path, entry in entries.items():
        if path.startswith("api_v2/models/") and path.endswith(".py"):
            for cls in ast.parse(archive.read(entry)).body:
                if not isinstance(cls, ast.ClassDef):
                    continue
                relations = {}
                for stmt in cls.body:
                    if not isinstance(stmt, ast.Assign) or not isinstance(stmt.value, ast.Call):
                        continue
                    call = stmt.value
                    if not isinstance(call.func, ast.Attribute) or call.func.attr not in ["ForeignKey", "ManyToManyField", "OneToOneField"]:
                        continue
                    target = call.args[0] if call.args else next(k.value for k in call.keywords if k.arg == "to")
                    name = target.value if isinstance(target, ast.Constant) else target.id
                    if name == "self":
                        name = cls.name
                    relations[stmt.targets[0].id] = {"model": "api_v2." + name.split(".")[-1].lower(), "many": call.func.attr == "ManyToManyField"}
                classes[cls.name] = ([b.id for b in cls.bases if isinstance(b, ast.Name)], relations)
    def inherited(name):
        bases, own = classes[name]
        result = {}
        for base in bases:
            if base in classes:
                result.update(inherited(base))
        result.update(own)
        return result
    return {"api_v2." + name.lower(): inherited(name) for name in sorted(classes)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=pathlib.Path, help="Use previously downloaded archive offline")
    parser.add_argument("--verify-origin", action="store_true", help="Independently verify selected file blobs against GitHub's pinned Git tree")
    args = parser.parse_args()
    if args.verify_origin:
        dest = ROOT / "data/upstream/open5e" / SHA
        tree = json.loads(fetch(f"https://api.github.com/repos/open5e/open5e-api/git/trees/{SHA}?recursive=1"))
        if tree.get("truncated"):
            raise ValueError("Git tree was truncated")
        blobs = {r["path"]: r["sha"] for r in tree["tree"] if r["type"] == "blob"}
        selected_blobs = {}
        for p in sorted(dest.rglob("*")):
            if not p.is_file() or p.name == "manifest.json":
                continue
            path = p.relative_to(dest).as_posix()
            raw = p.read_bytes()
            actual = hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()
            if blobs.get(path) != actual:
                raise ValueError(f"Origin blob differs: {path}")
            selected_blobs[path] = actual
        (ROOT / "docs/content/origin-blobs.json").write_bytes((json.dumps({"commit": SHA, "tree_sha": tree["sha"], "blobs": selected_blobs}, indent=2) + "\n").encode("utf8"))
        print(f"PASS: {len(selected_blobs)} raw files match the pinned upstream Git tree")
        raise SystemExit(0)
    archive_bytes = args.archive.read_bytes() if args.archive else fetch(f"https://codeload.github.com/open5e/open5e-api/zip/{SHA}")
    archive = zipfile.ZipFile(io.BytesIO(archive_bytes))
    if any(not p.filename.startswith(f"open5e-api-{SHA}/") for p in archive.infolist()):
        raise ValueError("Archive does not have the pinned commit prefix")
    entries = {p.filename.split("/", 1)[1]: p for p in archive.infolist() if "/" in p.filename and not p.is_dir()}
    dest = ROOT / "data/upstream/open5e" / SHA
    schema = relation_schema(entries, archive)
    selected = {p for p in entries if p.startswith("data/v2/wizards-of-the-coast/srd-2024/") or p in ["LICENSE.md", "README.md"] or p.startswith("api_v2/models/") and p.endswith(".py")}
    candidates = {}
    for path, entry in entries.items():
        if path.startswith("data/v2/") and path.endswith(".json"):
            for record in json.loads(archive.read(entry)):
                candidates.setdefault((record["model"], str(record["pk"])), []).append(path)
    # Dependency closure adds whole published files, never rewrites fixture bytes.
    while True:
        added = set()
        for path in selected:
            if not path.endswith(".json"):
                continue
            for record in json.loads(archive.read(entries[path])):
                for field, relation in schema[record["model"]].items():
                    value = record["fields"].get(field)
                    values = value if relation["many"] else [value]
                    for pk in values or []:
                        if pk is None or relation["model"] in ["api_v2.contenttype", "api_v2.image"]:
                            continue
                        options = candidates.get((relation["model"], str(pk)), [])
                        if options and not any(p in selected for p in options):
                            if len(options) != 1:
                                raise ValueError(f"Ambiguous dependency: {relation} {pk}: {options}")
                            added.add(options[0])
        if not added - selected:
            break
        selected.update(added)
    for path in sorted(selected):
        target = dest / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(archive.read(entries[path]))
    cache = ROOT / ".cache/s01"
    cache.mkdir(parents=True, exist_ok=True)
    if not args.archive:
        (cache / "upstream.zip").write_bytes(archive_bytes)
        for version in ["5.2", "5.2.1"]:
            (cache / f"SRD_CC_v{version}.pdf").write_bytes(fetch(f"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v{version}.pdf"))
    (ROOT / "docs/content/relations.json").write_bytes((json.dumps(schema, indent=2) + "\n").encode("utf8"))
    print(f"Selected {len(selected)} files at {SHA}")
