# Product direction and milestones

Projects and Resume are the central experience. IDEs, commands, Git, tools, themes, activity, and utilities support that workflow. The product should stay useful offline and without AI. DOAOR remains the parent brand until naming is settled.

## Foundation / first usable workflow

- Independent Tauri/React/TypeScript package, Rust domain modules, local SQLite storage.
- Configured scan folders and exclusions; reviewed imports; manual folder addition.
- Project list, search, pins, primary language indicators, preferred IDE, notes.
- Git branch/changes/latest commit/remote and locally known ahead/behind.
- Discovered and custom commands; reviewed execution in external Windows shells.
- Persisted, configurable Resume actions and recent project context.
- IDE detection/manual configuration/launching; local activity controls.
- Keyboard palette; theme presets, scaling, reduced motion; native window and dialogs.
- Website product page with truthful status and unavailable-download interaction.

## Next: reliability and everyday usage

- Exercise installations beyond the development machine; test all supported Windows shells and custom IDE paths.
- Background incremental metadata cache, scan progress details, deeper configurable scanning, robust cancellation within large individual projects, and explicit monorepo grouping.
- Broader IDE discovery including registry/App Paths, Toolbox custom locations, app version/icon extraction, and configurable launch arguments.
- Global indexed command search across all projects, list/grid/compact display preferences, and expanded sorting.
- Unsaved-note recovery, richer recent-file context, TODO/FIXME indexing, editable/removable commands and manual IDE entries.
- Shell adapters for Git Bash and WSL; optional rerun behavior per project with review when command definitions change.
- Signed Windows installer, icon/package metadata, update/release policy, privacy documentation, checksums and release notes. Public download links only after a tested build is ready.

## Next: managed development sessions

- Embedded terminal using a real PTY with proper resize, output backpressure, tabs, termination and shell lifecycle.
- Commands associated with owned processes, logs, stop/restart, exit results and opt-in completion notifications.
- Development-server readiness/ports, local URL opening, factual resume plans and missing-tool diagnostics.
- Clear separation between launched, running, finished, failed, and externally terminated processes.

## Later: supporting tools

- Lightweight utilities: JSON, UUID, timestamps/timezones, encoding, hashes, regex, diffs, colors, ports and HTTP requests. Start with evidence of actual use.
- Git operations with clear operation feedback and conflict handling; external repository links.
- Environment/package manager detection, factual build/test/dependency signals and project health without arbitrary scores.
- Local tasks, optional issue integrations, docs and expanded settings categories.

## Longer-term

- macOS/Linux platform adapters once Windows behavior is stable.
- Repository/module/dependency visualization, optional Home customization.
- Versioned extension interfaces for project detectors, tools, commands and utilities before any marketplace.
- Optional cloud sync/teams/remote development only as separately designed features.
- Optional AI for explicit tasks (summaries, documentation, repository understanding); never required for the core app and never silently uploading source.

## Website boundary

`doaor.com/software` describes the product and hosts eventual screenshots, documentation and downloads. The site retains its design and content. Never embed the website as the desktop app or fabricate screenshots, installers, platform support, or release dates.
