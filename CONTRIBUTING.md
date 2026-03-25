# Contributing to Diffchestrator

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Andrevops/diffchestrator.git
cd diffchestrator

# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Build
make build        # Full build (extension + webview)
make compile      # Extension only (fast)
make watch        # Watch mode for development

# Debug
# Press F5 in VS Code to launch Extension Development Host
```

## Project Structure

- `src/` — Extension source (TypeScript, esbuild bundled)
- `src/commands/` — Command handlers (one file per feature area)
- `src/providers/` — Tree data providers for sidebar views
- `src/services/` — Core services (repo manager, file watcher, status bar)
- `src/git/` — Git CLI wrapper and directory scanner
- `webview-ui/` — React app for multi-repo diff view (Vite + react-diff-view)
- `scripts/` — Release automation

## Conventions

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
perf: performance improvement
chore: maintenance / housekeeping
docs: documentation only
test: adding or updating tests
ci: CI/CD changes
refactor: code change that neither fixes nor adds
```

The release script auto-detects the bump type from commit messages:
- `feat:` = minor bump
- `fix:` / `perf:` = patch bump
- `BREAKING CHANGE` = major bump

### Code Style

- TypeScript with strict-ish settings (esbuild bundles, no tsc type checking in build)
- Use `repoManager.git` (shared singleton) instead of `new GitExecutor()`
- All commands registered via `CMD` constants in `src/constants.ts`
- All config keys via `CONFIG` constants
- Error handling: always show user-facing messages via `vscode.window.show*Message`

### Commands

When adding a new command:

1. Add the command ID to `CMD` in `src/constants.ts`
2. Register the handler in `src/extension.ts` or a command module
3. Declare the command in `package.json` under `contributes.commands`
4. Add menu entries if needed under `contributes.menus`
5. Add a keybinding if appropriate (use `Ctrl+D` chord prefix)

### Testing

We use Node.js native test runner for utility functions:

```bash
npm test
```

Tests are co-located with source files (`*.test.ts` in `src/utils/`). Focus on testing logic that doesn't depend on VS Code APIs.

## Pull Requests

1. Fork the repo and create a feature branch
2. Make your changes with conventional commit messages
3. Run `make build` to verify the build passes
4. Run `npm test` to verify tests pass
5. Submit a PR with a clear description of what changed and why

## Release Process

Releases are automated. Maintainers run:

```bash
make release      # Auto-detect bump, update changelog, tag, build
git push && git push --tags   # Triggers GitHub Actions release
```

The GitHub Actions workflow builds the `.vsix` and creates a GitHub Release with a grouped changelog.
