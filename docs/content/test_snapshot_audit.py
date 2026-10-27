"""Regression checks for the acquisition evidence, independent of the application."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SHA = "e69ac13b49dae6a9d84abf38fc674fe1db5b392b"


class SnapshotAuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(HERE, self.root / "docs/content", ignore=shutil.ignore_patterns("__pycache__"))
        shutil.copytree(ROOT / "data/upstream", self.root / "data/upstream")
        self.snapshot = self.root / "data/upstream/open5e" / SHA

    def run_audit(self):
        return subprocess.run([sys.executable, str(self.root / "docs/content/audit-snapshot.py")], capture_output=True, text=True)

    def test_clean_offline_snapshot(self):
        result = self.run_audit()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_raw_byte_tampering_is_rejected(self):
        source = self.snapshot / "data/v2/wizards-of-the-coast/srd-2024/Spell.json"
        source.write_bytes(source.read_bytes() + b"\n")
        result = self.run_audit()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("origin blob receipt", result.stderr)

    def test_unselected_file_is_rejected(self):
        (self.snapshot / "unexpected.txt").write_text("not selected")
        self.assertNotEqual(self.run_audit().returncode, 0)

    def test_missing_source_file_is_rejected(self):
        (self.snapshot / "README.md").unlink()
        self.assertNotEqual(self.run_audit().returncode, 0)

    def test_stale_reference_evidence_is_rejected(self):
        (self.root / "docs/content/reference-audit.json").write_text("{}\n")
        result = self.run_audit()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("reference-audit.json", result.stdout + result.stderr)

    def test_known_gaps_and_reference_semantics_remain_visible(self):
        report = json.loads((HERE / "reference-audit.json").read_bytes())
        self.assertEqual(report["duplicates"], [])
        self.assertEqual(report["unresolved_references"], [])
        self.assertEqual(len(report["excluded_image_references"]), 15)
        self.assertEqual(report["content_type_natural_keys"], 90)
        self.assertEqual(sum(r["count"] for r in report["reference_counts"]), 15641)
        self.assertEqual(len(report["fractional_source_prices"]), 46)
        parity = json.loads((HERE / "parity-audit.json").read_bytes())
        self.assertEqual(len(parity["added_magic_items"]), 15)
        self.assertTrue(all(not r["matching_records"] for r in parity["added_magic_items"]))
        self.assertEqual(parity["creature_patch_presence"], {"Knight": 1, "Octopus": 1, "Iron Golem": 1})
        self.assertEqual([r["status"] for r in parity["stat_block_checks"]], ["correction-required"] * 4 + ["matches"])
        self.assertFalse(parity["parity_claim"])


if __name__ == "__main__":
    unittest.main()
