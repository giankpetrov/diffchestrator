# Changelog

## 0.20.x — Current

> Built for Claude Code — multi-repo Git orchestration as a companion to Anthropic's CLI for agentic coding.

### Claude Code Integration
- AI Commit via Claude CLI — runs in terminal for real-time output
- Open Claude Code with `claude -c` to continue previous session
- Multi-repo mode with `claude --add-dir` for selected repos
- Commit/change notifications with "Show Terminal" and "View Changes" action buttons
- Changes notification debounced 15s to avoid mid-edit alerts
- Yolo command (claude-sandbox) — reuses existing session
- "Ask Claude" button per diff hunk in webview
- Configurable permission mode for Claude CLI

### Active Repos & Workspace Switching
- Active Repos sidebar view with MRU recent repos (up to 10)
- Persisted across VS Code reloads and restarts
- `Ctrl+D, Tab` cycles through all recent repos (rotates full list)
- `Ctrl+D, Q` close current, `Ctrl+D, Shift+Q` pick which to close, `Ctrl+D, Shift+Tab` close all
- Per-repo terminal tracking by type (Claude, Yolo, Shell)
- Terminal status indicators in Active Repos view (shows which types are running)
- Auto-switch terminal panel when changing repos (priority: Claude > Yolo > Shell)
- Terminal tab sync — clicking a terminal tab auto-selects the repo and opens its files
- Auto-add repos to Active Repos when opening terminals
- Terminal name substring matching adopts untracked terminals (longest match wins)

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
- Ahead/behind remote badges (↑N ↓M) across all views
- Last commit message and relative date in repo tooltips
- State-dependent tree item IDs for proper selection clearing

### Diff Viewing & Review Workflow
- Native VS Code diff editor for changed files
- Navigate changed files with `Ctrl+D, N`/`Shift+N` or ↑↓ editor title bar buttons
- Auto-advance to next pending file after staging (sidebar + editor title bar)
- Auto-close stale diff when switching to a clean repo
- Context restore — switching back to a repo reopens the last viewed file
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

### Search & Navigation
- Three-tier git grep search: selected repo (`Ctrl+D, /`), active repos (`Ctrl+D, .`), all repos (`Ctrl+D, Shift+/`)
- Multi-repo search results show `[repo-name]` badge, selecting auto-switches repo
- Browse files in repo via QuickPick (`git ls-files`)
- Switch repo via QuickPick (sorted by changes) — triggers full viewDiff flow
- Open repo in new VS Code window (`Ctrl+D, W`)
- Favorite current repo shortcut (`Ctrl+D, E`)

### Terminal & Session Management
- Per-repo terminal management (shell, claude, yolo tracked independently)
- Terminal reuse — `Ctrl+D, L` and `Ctrl+D, Y` reuse existing sessions
- Terminal name pattern matching adopts untracked terminals automatically
- Auto-switch terminal panel when changing repos (priority: Claude > Yolo > Shell)

### Developer Experience
- Inline current-line blame (GitLens-style, toggleable)
- File watcher with 500ms debounce for real-time updates
- Auto-refresh polling pauses when VS Code loses focus, refreshes on refocus
- Status bar with repo summary + active repo indicator
- 25 chord keybindings under `Ctrl+D` prefix
- Full context menu integration on repos and files
- Auto-detect release script (`npm run release`) — reads conventional commits for semver bump

### Performance (v0.13.6+)
- `refreshRepo` only fires events when data actually changes (~90% fewer tree rebuilds)
- `shortStatus` parses branch + ahead/behind in one git call (was two separate calls)
- 500ms TTL cache on `git status()` deduplicates concurrent calls
- `refreshAll` batched to 5 concurrent repos (was unbounded)
- `_refreshLastCommits` has 60s cooldown and runs in parallel batches
- Focus regain resets the interval timer to prevent double-refresh
- Selection change no longer rebuilds the tree — only re-renders visible items
