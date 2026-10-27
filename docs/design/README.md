# A05 review baseline

`a05-interface-review.html` preserves the interactive review source accepted as the visual baseline on October 27, 2026. It is an HTML fragment for the conversation preview, not a production page or implementation of game rules, persistence or security boundaries. The authoritative approval state and pending functional choices are in `UI_EDITOR_CONTRACT.md` and `WORK_BOARD.md` at the repository root.

The baseline includes the bottom inspector dock, independent active-creature sheet, HP beside sheet/inspector names, top horizontal player turn queue with arrow-tab collapse, unknown public identities, and commit-on-field-departure/Enter (Ctrl+Enter for multiline text). The synthetic fixture contains both storyteller and public presentations in one review document; production requires separate role-filtered processes and payloads.

Run the local mock checks from the repository root after installing the existing project dependencies:

```powershell
node docs/design/check-a05-preview.cjs
```

The script uses installed Microsoft Edge in headless mode through Playwright. Screenshots go to ignored `test-results/a05-review/`. It checks dock position/resize/scroll, selection versus active turn, raw input/commit triggers, save failure/retry, multiline text, player queue/labels and responsive overflow. These are design-fixture checks; they do not replace product tests or G03's Windows/mixed-DPI/accessibility validation.

The script can render the fragment for inspection without the conversation host. Optional host design controls/state APIs are guarded. Do not ship this fixture as the application or treat its sample values as the catalog.
