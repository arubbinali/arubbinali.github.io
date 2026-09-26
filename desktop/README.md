# DOAOR Developer Software

Windows desktop workspace built with Tauri 2, Rust, React, TypeScript, and SQLite. This is the first development milestone, not a public release.

The `desktop/` directory is a self-contained package with its own manifests, dependency locks, native source, and build output. It can be moved intact into a dedicated repository. It does not load doaor.com or depend on the website's React build.

## Run on Windows

Prerequisites: Node.js 22+, Rust stable with the MSVC toolchain, Microsoft C++ Build Tools plus Windows SDK, and WebView2. See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

```powershell
cd desktop
npm ci
npm run desktop
```

The launcher includes `%USERPROFILE%\.cargo\bin` in the child process PATH, without changing the system PATH. The development server binds only to `127.0.0.1:1420`.

```powershell
# Typecheck and build the frontend
npm run build
npm test
# Native tests (including real Git fixtures, no user projects changed)
& "$env:USERPROFILE\.cargo\bin\cargo.exe" test --manifest-path src-tauri\Cargo.toml --lib
# Standalone Windows development executable with bundled frontend
npm run tauri -- build --debug --no-bundle
```

The executable is `src-tauri/target/debug/doaor-workspace.exe`. Debug builds are large and unsigned. Installer bundling is intentionally disabled until release preparation. Closing the app does not stop external terminals or IDEs.

The app maximizes after its automatic introduction (or immediately when the intro is disabled). Transparent custom window controls replace the native title bar. Interface scale defaults to 135%, with choices from 125% to 250%; older saved values below 125% are read as 135%. The lowercase wordmark preserves the website's fixed logo sizing independently of interface scale.

`npm run dev` opens a browser interface preview only. Native filesystem, database, and launch controls require the desktop window; the preview contains no fake workspace data.

## First workflow

The empty Home screen now includes a four-step interactive example. It is isolated presentation data: it never creates projects, runs commands, or records activity. Choose **Choose my first project** to start with a real folder.

Appearance includes an optional short DOAOR introduction, ambient surfaces, compact project rows, existing themes, scale and reduced motion. Montserrat and Montserrat Alternates are bundled locally, matching the website without runtime font requests. Presentation-only preferences use this app's local webview storage; project and workspace records remain in SQLite.

OLED is the default. The available set is OLED plus doaor.com's Light, Stillwater, Sepia, Sage, and Aubergine palettes. Older DOAOR, Dark, Graphite, and System preferences migrate to OLED. The introduction uses six dark crimson/pink color fields and two rotating fluid layers. Its window and wordmark are centered before the workspace maximizes. Windows builds use the GUI subsystem in both development and release builds, so opening the executable does not create a console window.

Progress notifications float above the workspace after a 650 ms delay, so quick operations don't flash a loading banner. Success notices dismiss after five seconds; errors stay until dismissed. Project refreshes retain the existing detail panel while loading.

1. In Settings, add a scan folder and optional excluded folders. Scan & review finds marker-based projects. Select candidates to import. Add project also supports folders without known markers.
2. In Tools, detect installed IDEs or add an `.exe` manually. Detection also runs on the first launch. Pin/hide tools as needed.
3. Open a project, choose its preferred IDE, and inspect Overview, Git, or Commands. Commands are discovered from package scripts and supported language manifests; custom commands can be saved.
4. Open the IDE or launch a command. Commands run in the saved working directory using the selected external shell. Review the exact command before launching it.
5. Save notes and a Resume plan: IDE, terminal, optional saved command, and optional HTTP(S) URL. Resume shows the plan before executing it. A command and requested terminal share one window.
6. Quit and reopen. Project preferences, notes, recent launches, activity, and Resume plans survive in SQLite. Home shows the most recently opened project.

## Boundaries and current limitations

- No cloud/account/telemetry. Core operations do not fetch from the network. Launched applications and user commands may use the network themselves.
- Git is read-only. Ahead/behind uses existing refs and does not fetch. Git errors are shown, not treated as a clean repository.
- Resume records process creation, **not** command completion or successful IDE loading. External terminals report command output. No process manager yet.
- An HTTP(S) URL opens immediately; there is no development-server readiness probe yet.
- IDE detection covers common VS Code, JetBrains, Android Studio, Cursor, Sublime, and Visual Studio locations. Nonstandard locations use manual addition; detected versions and Git Bash/WSL adapters are follow-on work.
- Discovery skips symlinks/reparse points and generated folders, is cancellable between entries, and is bounded to 7 levels / 30,000 entries / 500 candidates. Language/recent-file sampling is bounded to 5 levels / 8,000 entries per project. Language labels are approximate file counts, not byte percentages. Scans are explicit; filesystem watchers/incremental indexing are later work.
- `.git`, manifests, solutions and project files are strong markers. `.idea` / `.vscode` alone are deliberately not sufficient; add such folders manually.
- Activity retains the newest 2,000 records and displays the newest 200. Disabling recording stops new history and recent-launch updates; existing records remain until cleared. Removing a project removes its stored commands/notes/preferences, never its files.
- Utilities, embedded terminal tabs, Git write actions, task detection, advanced search, and plugin hosting are not presented as completed features.

## Data and architecture

SQLite lives in Tauri's per-user local data directory for `com.doaor.workspace`; Settings displays the actual path. Data is never written into projects. Schema version 1 persists settings, IDEs, projects, commands, and activity. Newer unknown schemas are rejected to avoid downgrade corruption. For a backup, close the app and copy the database plus any WAL/SHM sidecars together.

`src/useWorkspace.ts` owns application state and async interaction orchestration. `src/views/` owns screens; `src/components/` owns accessible dialogs and the command palette. `src/api.ts` is the only native command boundary. `src/types.ts` defines the serialized domain contract.

Rust modules:

- `discovery`: bounded filesystem traversal, language sampling and command discovery.
- `database`: schema initialization and persisted domain records.
- `git`: read-only process probes with output caps and timeouts.
- `platform`: Windows IDE and shell adapters; literal paths are escaped and passed using encoded PowerShell scripts.
- `actions`: open/run/resume orchestration, partial failure reporting and activity. An injected launcher makes workflow tests independent of actual application launches.
- `lib`: Tauri commands dispatch blocking IO to worker threads. The frontend has no generic shell or filesystem plugin permissions.

See [ROADMAP.md](ROADMAP.md) for the retained product vision and the next milestones.
