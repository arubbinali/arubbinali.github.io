# Milestone validation

Verified locally on Windows on 2026-09-19. This package is not code-signed yet.

## Automated checks

- Frontend typecheck and production build pass, including unused-code checks.
- Six frontend tests pass: project filtering/sorting and presentation checks for delayed progress, error priority, dismissible success, and the isolated onboarding example.
- Eleven Rust tests pass. Coverage includes bounded discovery/exclusions, command discovery, SQLite persistence, read-only Git fixtures, the discover/select/launch/restart/resume workflow, changed-command rejection, partial launch failures, and disabled activity recording.
- Workflow tests inject a launcher: they verify launch requests and saved state without opening a user's IDE or running project commands.
- A separate real PowerShell test verifies the encoded launch script enters a temporary directory containing apostrophe and ampersand characters correctly.
- Rust formatting and Clippy checks pass with warnings denied.

## Interface checks

- The native Windows executable was opened and rendered with the real local database, without sample projects.
- The rebuilt development executable opened as one DOAOR window with no accompanying console window.
- The website development server compiled successfully. `/software` loads, its Download button opens the under-development dialog, and closing the dialog restores focus to Download.
- The desktop browser preview clearly identifies itself as a preview and does not pretend native operations are available.

## Remaining release work

Broader real-IDE compatibility testing, longer sessions with large repositories, accessibility and cross-device checks, signed installer packaging, and release preparation remain. External command launches do not provide completion monitoring. See README.md and ROADMAP.md for current boundaries and the retained product roadmap.

No live website deployment or public software release was performed.
