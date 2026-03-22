# Changelog

## 0.11.x — Current

> Built for Claude Code — multi-repo Git orchestration as a companion to Anthropic's CLI for agentic coding.

### Claude Code Integration
- AI Commit via Claude CLI — runs in terminal for real-time output
- Open Claude Code with `claude -c` to continue previous session
- Multi-repo mode with `claude --add-dir` for selected repos
- Yolo command (claude-sandbox) — reuses existing session
- "Ask Claude" button per diff hunk in webview
- Configurable permission mode for Claude CLI

### Active Repos & Workspace Switching
- Active Repos sidebar view with MRU recent repos (up to 10)
- `Ctrl+D, Tab` cycles through all recent repos (rotates full list)
- Per-repo terminal tracking by type (Claude, Yolo, Shell)
- Terminal status indicators in Active Repos view (shows which types are running)
- Auto-switch terminal panel when changing repos (priority: Claude > Yolo > Shell)
- Terminal name pattern matching adopts untracked terminals automatically

### Repository Discovery
- BFS directory scanner with configurable depth and skip directories
- Auto-scan workspace folders on startup if no roots configured
- Auto-detect new workspace folders and offer to add to scan roots
- Changed-only filter with changed repos sorted first

### Sidebar Views
- Active Repos — recent repos with terminal indicators and role badges (active/selected/recent)
- Changed Files — staged/unstaged/untracked grouping with view description
- Favorites — pinned repos with active highlight (blue star + ● indicator)
- Repositories — hierarchical tree with active/selected/clean visual states
- Activity bar badge with total change count
- Last commit message and relative date in repo tooltips
- State-dependent tree item IDs for proper selection clearing

### Diff Viewing & Review Workflow
- Native VS Code diff editor for changed files
- Auto-advance to next pending file after staging (sidebar + editor title bar)
- Auto-close stale diff when switching to a clean repo
- Multi-repo diff webview with react-diff-view
- Per-file stage/unstage controls in diff view

### Git Operations
- Stage/unstage individual files and all files
- Discard changes (single file or all) with confirmation
- Commit with message input
- Push and Pull with progress notifications
- Bulk commit/push across selected repos

### Branch & Stash
- Branch switcher with create new branch option
- Stash management: push, list, pop, apply, view diffs
- Commit history viewer (last 15 commits with full diff)

### Terminal & Navigation
- Per-repo terminal management (shell, claude, yolo tracked independently)
- Terminal reuse — commands reuse existing sessions
- Browse files in repo via QuickPick (`git ls-files`)
- Switch repo via QuickPick (sorted by changes)
- Open repo in new VS Code window for full native search
- Favorite current repo shortcut (`Ctrl+D, E`)

### Developer Experience
- Inline current-line blame (GitLens-style, toggleable)
- File watcher with 500ms debounce for real-time updates
- Auto-refresh polling pauses when VS Code loses focus, refreshes on refocus
- Status bar with repo summary + active repo indicator
- 17 chord keybindings under `Ctrl+D` prefix
- Full context menu integration on repos and files
- Auto-detect release script (`npm run release`) — reads conventional commits for semver bump
