# Changelog

## 0.1.0 — Initial Release

> Built for Claude Code — multi-repo Git orchestration as a companion to Anthropic's CLI for agentic coding.

### Claude Code Integration
- AI Commit via Claude CLI — runs in terminal for real-time output
- Open Claude Code with `--add-dir` for multi-repo context
- Yolo command (claude-sandbox)
- "Ask Claude" button per diff hunk in webview
- Configurable permission mode for Claude CLI

### Repository Discovery
- BFS directory scanner with configurable depth and skip directories
- Auto-scan workspace folders on startup if no roots configured
- Auto-detect new workspace folders and offer to add to scan roots
- Changed-only filter with changed repos sorted first

### Sidebar Views
- Repositories tree with hierarchical grouping and common prefix collapsing
- Favorites section for pinned repos and directories
- Changed Files view with staged/unstaged/untracked grouping
- Activity bar badge with total change count
- View descriptions showing active repo + branch
- Last commit message and relative date in repo tooltips

### Git Operations
- Stage/unstage individual files and all files
- Discard changes (single file or all) with confirmation
- Commit with message input
- Push and Pull with progress notifications
- AI Commit via Claude CLI (runs in terminal for real-time output)
- Bulk commit/push across selected repos

### Branch & Stash
- Branch switcher with create new branch option
- Stash management: push, list, pop, apply, view diffs
- Commit history viewer (last 15 commits)

### Terminal & Claude
- Open terminal at any repo/directory (reused across commands)
- Open Claude Code with `--add-dir` for multi-repo context
- Yolo command (claude-sandbox)
- Browse files in repo via QuickPick
- Switch repo via QuickPick

### Developer Experience
- Inline current-line blame (GitLens-style, toggleable)
- File watcher with 500ms debounce for real-time updates
- Auto-refresh polling (configurable interval)
- Status bar with repo summary + active repo indicator
- 14 chord keybindings under `Ctrl+D` prefix
- Full context menu integration on repos and files
