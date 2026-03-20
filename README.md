# Diffchestrator — VS Code Extension

> **Built for Claude Code.** Multi-repo Git orchestration designed as a companion to [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic's CLI for agentic coding. Stage, review, and commit across repos without leaving VS Code, then hand off to Claude for AI-powered commits, code reviews, and multi-repo workflows.

## Why Diffchestrator?

Claude Code works best when you can see what it changed, across every repo it touched. Diffchestrator gives you that visibility: a sidebar tree of all your repos, real-time change tracking, one-click diffs, and direct terminal integration with `claude`. No context switching, no manual `git status` in twelve terminals.

## Features

### Claude Code Integration
- **AI Commit** — runs `claude --permission-mode acceptEdits` in the repo's terminal so you see output in real-time (`Ctrl+D, C`)
- **Open Claude Code** — launches `claude` for single repos, or `claude --add-dir` for multiple selected repos (`Ctrl+D, L`)
- **Yolo** — opens terminal and runs the `yolo` alias from claude-sandbox (`Ctrl+D, Y`)
- **Ask Claude** button per diff hunk in the multi-repo diff webview
- **Terminal reuse** — repo terminals are tracked and reused across commands

### Repository Discovery
- **Auto-scan** a root directory to discover all git repos (BFS, configurable depth)
- **Auto-scan workspace folders** on startup if no roots configured, and when new folders are added
- **Skip directories** like `node_modules`, `.terraform`, `vendor`, `build`, etc. (configurable)
- **Changed-only filter** — toggle to show only repos with uncommitted changes (`Ctrl+D, D`)
- **Changed repos sort first** in the tree for quick access

### Sidebar Views
- **Repositories** — hierarchical tree with common path prefix collapsing, change count badges
- **Favorites** — pin repos and directories for quick access (right-click > Toggle Favorite)
- **Changed Files** — staged/unstaged/untracked files for the selected repo, grouped by status
- **View descriptions** — active repo name + branch shown next to the "Changed Files" title
- **Activity bar badge** — total change count across all repos
- **Tooltips** — hover a repo to see path, branch, change counts, remote URL, and last commit message with relative date

### Diff Viewing
- Click a changed file to open VS Code's **native diff editor** (split view with syntax highlighting)
- **Multi-repo diff webview** — aggregated diffs across multiple selected repos with react-diff-view
- Per-file stage/unstage controls in the diff view
- **Inline blame** — GitLens-style current-line blame showing author, date, and commit message (`Ctrl+D, G` to toggle)

### Git Operations
- **Stage / Unstage** individual files or all files (inline buttons + context menu)
- **Discard changes** — revert a single file or all changes with confirmation dialog
- **Commit** with message input box
- **Push** with progress notification
- **Pull** with progress notification (`Ctrl+D, U`)
- **Bulk commit/push** across multiple selected repos

### Branch & Stash Management
- **Branch Switcher** (`Ctrl+D, B`) — QuickPick listing all local branches with current branch marked, plus "Create new branch..." option
- **Stash Management** (`Ctrl+D, A`) — stash push (with message), list stashes, pop latest, apply specific stash, view stash diffs
- **Commit History** (`Ctrl+D, H`) — QuickPick showing last 15 commits, select to view full diff in editor

### File Watcher
- Automatic filesystem watching per repo with 500ms debounce
- Status updates in real-time when files change externally (terminal, other editors)
- Falls back to polling at configurable interval (default 10s)

### Status Bar
- **Left**: repo count + total changes (click to open sidebar)
- **Right**: active repo name + branch + changes with prominent background (click to switch repo)

## Keyboard Shortcuts

All shortcuts use **Ctrl+D** as a chord prefix — press `Ctrl+D`, release, then press the letter:

| Chord | Action |
|-------|--------|
| `Ctrl+D, C` | AI Commit (Claude) |
| `Ctrl+D, L` | Open Claude Code |
| `Ctrl+D, Y` | Yolo (claude-sandbox) |
| `Ctrl+D, S` | Scan for repositories |
| `Ctrl+D, R` | Switch active repo |
| `Ctrl+D, F` | Browse files in repo |
| `Ctrl+D, P` | Push |
| `Ctrl+D, U` | Pull |
| `Ctrl+D, T` | Open terminal at repo |
| `Ctrl+D, D` | Toggle changed-only filter |
| `Ctrl+D, H` | Commit history |
| `Ctrl+D, B` | Switch branch |
| `Ctrl+D, A` | Stash management |
| `Ctrl+D, G` | Toggle inline blame |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `diffchestrator.scanRoots` | `[]` | Root directories to scan for repos |
| `diffchestrator.scanMaxDepth` | `6` | Maximum directory depth for scanning |
| `diffchestrator.scanExtraSkipDirs` | `[]` | Additional directory names to skip |
| `diffchestrator.scanOnStartup` | `true` | Auto-scan configured roots on VS Code start |
| `diffchestrator.changedOnlyDefault` | `false` | Show only changed repos by default |
| `diffchestrator.autoRefreshInterval` | `10` | Auto-refresh interval in seconds (3-120) |
| `diffchestrator.claudePermissionMode` | `acceptEdits` | Permission mode for Claude CLI |
| `diffchestrator.showInlineBlame` | `true` | Show inline git blame on current line |
| `diffchestrator.favorites` | `[]` | Persisted favorite paths (managed by extension) |

## Getting Started

1. Install the extension (F5 to run in development, or package with `vsce`)
2. Add your project root to settings:
   ```json
   {
     "diffchestrator.scanRoots": ["/home/user/projects"]
   }
   ```
   Or just open a folder — the extension auto-detects workspace folders if no roots are configured.
3. The extension auto-scans on startup and populates the sidebar
4. Click a repo to see its changed files, click a file to see the diff
5. Use `Ctrl+D, C` to AI commit with Claude, `Ctrl+D, L` to open Claude Code

## Development

```bash
# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Build
npm run build          # Extension + webview
npm run compile        # Extension only
npm run build:webview  # Webview only

# Debug
# Press F5 in VS Code to launch Extension Host
```

## Architecture

```
src/
├── extension.ts              # Activation entrypoint
├── constants.ts              # Command/view/config IDs
├── types.ts                  # Shared TypeScript interfaces
├── git/
│   ├── gitExecutor.ts        # Git CLI wrapper (child_process.execFile)
│   │                         # status, diff, stage, unstage, commit, push, pull,
│   │                         # log, branches, checkout, stash, blame, show, clean
│   └── scanner.ts            # BFS directory scanner
├── providers/
│   ├── repoTreeProvider.ts   # Repo tree with last-commit tooltips
│   ├── favoritesTreeProvider.ts
│   ├── changedFilesProvider.ts
│   └── gitContentProvider.ts # TextDocumentContentProvider for diff/show URIs
├── commands/
│   ├── scan.ts               # Scan/rescan
│   ├── stage.ts              # Stage/unstage file + all
│   ├── commit.ts             # Commit (single + bulk)
│   ├── push.ts               # Push (single + bulk)
│   ├── pull.ts               # Pull with progress
│   ├── aiCommit.ts           # Claude CLI AI commit (runs in terminal)
│   ├── openClaude.ts         # Open Claude Code terminal
│   ├── terminal.ts           # Open terminal + yolo
│   ├── favorites.ts          # Toggle favorites
│   ├── fileSearch.ts         # Browse files + switch repo
│   ├── commitHistory.ts      # Commit history viewer
│   ├── discard.ts            # Discard file/all changes
│   ├── switchBranch.ts       # Branch switcher + create
│   └── stash.ts              # Stash push/list/pop/apply
├── services/
│   ├── repoManager.ts        # Central state management
│   ├── fileWatcher.ts        # Per-repo filesystem watcher
│   ├── statusBar.ts          # Status bar items
│   ├── inlineBlame.ts        # Current-line git blame decorations
│   └── workspaceAutoScan.ts  # Auto-scan workspace folders
├── views/
│   └── diffWebviewPanel.ts   # Multi-repo diff webview
└── utils/
    ├── paths.ts
    └── disposable.ts

webview-ui/                   # React app for multi-repo diff
├── src/
│   ├── App.tsx               # Diff viewer with react-diff-view
│   └── vscode.ts             # VS Code API wrapper
└── vite.config.ts            # Builds to dist/webview/
```

## Tech Stack

- **Extension**: TypeScript, VS Code Extension API, esbuild
- **Git**: `child_process.execFile` (no shell=true)
- **Webview**: React 19, Vite, react-diff-view
- **AI**: Claude Code CLI integration
- **No backend server** — everything runs in-process via the VS Code extension host
