# Contributing and collaboration agreement

CoPicker integrates with private, version-sensitive Codex desktop surfaces. Contributions are welcome for owner-authorized collaboration, but a plausible code change is not enough: source identity, safety boundaries, offline validation, live effects, user acceptance, and publication must remain distinct.

The repository currently has no general open-source license. Public visibility alone does not grant redistribution or derivative-work rights. Discuss licensing with the repository owner before broader third-party reuse.

## Read before changing code

1. [AGENTS.md](AGENTS.md) — repository safety and workflow rules;
2. [docs/accepted-baseline.md](docs/accepted-baseline.md) — accepted product requirements and exact values;
3. [docs/architecture.md](docs/architecture.md) — installation/runtime/settings data flow;
4. [docs/development.md](docs/development.md) — commands, package structure, and release workflow;
5. [docs/validation.md](docs/validation.md) — proof layers and live acceptance checklists.

If the requested change conflicts with an accepted `CP-*` requirement, stop and obtain an explicit product decision rather than quietly redefining the baseline.

## Establish the work boundary

Before editing:

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git remote -v
```

Confirm:

- the intended checkout/worktree and branch;
- whether unrelated user changes exist;
- whether the task is read-only analysis, source implementation, local installation, live injection, restart, push, tag, or release;
- which `CP-*` requirements are affected;
- which Codex version/build supplied the compatibility evidence.

Do not infer authorization for a live or publication action from authorization to edit source.

## Branch and commit workflow

For development work, clone `main` normally and create a `codex/` branch unless the owner requests direct work on `main`:

```bash
git clone https://github.com/Wineondili/copicker.git
cd copicker
git switch main
git pull --ff-only
git switch -c codex/my-change
```

Use small coherent commits with English imperative messages. Preserve unrelated changes. Every completed change batch must add a timestamped, timezone-qualified entry to `CHANGELOG.md`.

Do not use a shallow release-tag installation checkout for ongoing development.

## Version layers

CoPicker has independent version layers:

- release tag/GitHub Release;
- `ProjectInfo.version` for the CLI and plugin;
- renderer `VERSION` in `model-rail.js`;
- settings schema version;
- MCP settings resource URI version;
- accepted runtime commit;
- observed Codex desktop version/build.

Change only the layer whose compatibility or distribution meaning changed. Update code, tests, [docs/accepted-baseline.md](docs/accepted-baseline.md), README, installation instructions, and changelog together. A renderer-only DOM/CSS/lifecycle change normally bumps the renderer compatibility version so an existing in-memory payload is replaced; it does not automatically require a CLI release tag.

Never rename legacy `codex-model-rail` state keys, host IDs, resource names, or logging identifiers merely for branding. They require a migration that can remove already injected older state.

## Safety rules

- Never modify, replace, unpack into, or re-sign `/Applications/ChatGPT.app` without an explicit scope change from the owner.
- Never terminate or restart Codex from an active Codex task without explicit approval.
- Never modify the real user LaunchAgent during tests.
- Bind Inspector only to `127.0.0.1`, fail closed on unknown ownership, and close it after the bounded action.
- Never log or persist conversation text, composer text, task contents/IDs, authentication data, cookies, or tokens.
- Keep the default CLI action read-only.
- Resolve account-specific model, effort, and Fast identifiers from `model/list`.
- Use `thread/settings/update` plus `thread/settings/updated` for an existing task. Use only the exact official-control proxy for a new unsent task.
- Preserve an explicit rollback path and the prior accepted runtime commit.

## UI and product changes

The accepted baseline, not a historical screenshot, is the starting authority.

For rail changes:

- preserve the independent body-level Shadow DOM popover;
- preserve first-level picker activation and full-width input-list exclusion;
- preserve model order, effort counts, Fast restrictions, `Other`, keyboard behavior, placement latching, and dismissal unless explicitly changed;
- use `tools/model-rail-tuner.html` for isolated geometry exploration;
- record exact source/rendered values and live scenarios.

For settings changes:

- do not import private minified Codex React components into the plugin/fallback;
- reuse current host tokens and semantic controls;
- inspect actual official DOM/computed styles for geometry;
- do not use screenshots as the sole authority for top/scroll/page placement;
- preserve native/fallback deduplication, one settings store, autosave, revision conflicts, and explicit Apply-now behavior.

Any intentional product change should update or supersede named `CP-*` requirements instead of leaving contradictory prose.

## Offline validation required for every change

```bash
git diff --check
swift package dump-package >/dev/null
node --check Sources/CopickerCLI/Resources/model-rail.js
bash -n script/build_and_run.sh script/install.sh
swift test
swift build -c release
```

If Node.js is unavailable, record that the optional JavaScript check was not run. Do not report a test as passed when it was skipped.

Tests must not signal or attach to Codex. Add or update contract assertions for every changed safety boundary, selector, behavior, geometry, version, package, installation, or documentation anchor.

## Live validation

Live work requires a separate, explicit boundary. Record:

- exact CoPicker commit/tag;
- exact Codex version/build and process path;
- the authorized command or interaction;
- selector/settings scenarios exercised;
- whether selection state was written/restored;
- watcher, restart, cold-login, and UI results separately;
- confirmation that port `9229` closed.

Follow the checklists in [docs/validation.md](docs/validation.md). Never infer live compatibility from a build, unit test, preview, push, or release.

## Documentation expectations

Public docs must let a new collaborator answer:

- Which release or exact commit should I install?
- Which feature set does it contain?
- Which Codex build was actually accepted?
- What files and user state are installed?
- What actions are read-only, live, persistent, destructive, or published?
- How do model switching and settings persistence work?
- Which requirements must not regress?
- Which tests guard them?
- How do I roll back?

Machine-local screenshots, temporary paths, and private logs may be mentioned only as historical evidence; portable public docs must not depend on them being present.

## Pull requests and direct pushes

Follow the repository owner's requested publication workflow. Before any push or PR:

1. verify branch, HEAD, worktree, and remote state;
2. summarize affected `CP-*` requirements;
3. list exact validation performed and explicitly untested gates;
4. include compatibility and migration/rollback notes;
5. keep source push, tag, GitHub Release, installation, and live acceptance as separate statuses.

Do not create, delete, or move release tags without explicit owner authorization.

## Compatibility report template

```text
Summary:
Affected CP requirements:
CoPicker base/result SHA:
CLI/plugin version:
Renderer version:
Settings schema/resource:
Codex version/build:
macOS/architecture:
Changed paths:
Offline checks:
Read-only status:
Live actions authorized/performed:
UI scenarios:
Inspector closure:
Known failures or untested gates:
Rollback ref and procedure:
Publication state:
```
