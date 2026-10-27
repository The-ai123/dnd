# Storyteller

An offline Windows tabletop application with a private storyteller window and a separate public player display.

## Development

Use Node.js 24 and npm 11 on Windows x64.

```powershell
npm ci
npm start
npm run check
npm run package
npm run test:e2e
```

`npm run package` builds `out/Storyteller-win32-x64/storyteller.exe`. The end-to-end test launches that package, not the development server. `npm run make` creates a portable ZIP; an installer is future release work. Native SQLite dependencies are rebuilt by Forge for the pinned Electron ABI. Runtime operation needs no network; dependency installation and the first packaging build need downloads.

## Architecture foundation

| Location | Responsibility |
| --- | --- |
| `apps/desktop/main` | Window lifecycle, sender permissions, utility-process orchestration |
| `apps/desktop/preload` | Distinct capability bridges for storyteller and player |
| `apps/desktop/storyteller` | React private application shell |
| `apps/desktop/player` | React public presentation shell |
| `packages/contracts` | Strict runtime IPC and projection schemas |
| `packages/domain` | Framework-independent domain primitives |
| `packages/engine` | Serialized authority and allowlisted public projections |
| `packages/persistence` | SQLite/native backup compatibility adapter |
| `packages/assets` | sharp tile-generation compatibility adapter |
| `packages/map-view` | PixiJS WebGL public-scene adapter |

The SQLite engine and image jobs run in separate Electron utility processes. Neither renderer has Node/filesystem/database access. Player messages are checked against the registered sender and current public scene identity. Tests guard module imports and reject hidden/stale selection input.

This is the A03 architecture compatibility milestone, not a playable application. Startup uses synthetic entities and a disposable probe database/backup under the application data `compatibility` directory. It does not open or modify real worlds. The fixture does not prove fog geometry, production world backup orchestration, history, migrations, or game rules. These remain later tasks in `IMPLEMENTATION_PLAN.md`.

Rules, geometry, recovery, content, and shared UI packages will be introduced when their dependency gates and contracts are ready. Tiptap will be pinned with the document-editor milestone rather than installed unused.

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for verification evidence and next steps. The product contracts and outstanding behavior decisions remain indexed in [PLANNING_INDEX.md](PLANNING_INDEX.md).
