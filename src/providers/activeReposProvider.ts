import * as vscode from "vscode";
import * as path from "path";
import type { RepoManager } from "../services/repoManager";
import type { RepoSummary } from "../types";
import { CMD } from "../constants";
import { hasActiveTerminal, showTerminalIfExists } from "../commands/terminal";

type Role = "active" | "selected" | "recent";

interface ActiveRepoNode {
  repo: RepoSummary;
  role: Role;
  hasTerminal: boolean;
}

export class ActiveReposProvider implements vscode.TreeDataProvider<ActiveRepoNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ActiveRepoNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private repoManager: RepoManager) {
    repoManager.onDidChangeSelection(() => this._onDidChangeTreeData.fire());
    repoManager.onDidChangeRepos(() => this._onDidChangeTreeData.fire());

    // Refresh when terminals open/close to update terminal indicators
    vscode.window.onDidOpenTerminal(() => this._onDidChangeTreeData.fire());
    vscode.window.onDidCloseTerminal(() => this._onDidChangeTreeData.fire());
  }

  getTreeItem(element: ActiveRepoNode): vscode.TreeItem {
    const r = element.repo;
    const item = new vscode.TreeItem(r.name, vscode.TreeItemCollapsibleState.None);

    const parts: string[] = [];
    if (r.branch) parts.push(r.branch);
    if (r.totalChanges > 0) parts.push(`${r.totalChanges} changes`);

    // Terminal indicator
    const termIcon = element.hasTerminal ? "$(terminal) " : "";

    if (element.role === "active") {
      item.description = `${termIcon}● ${parts.join(" · ")}`;
      item.iconPath = new vscode.ThemeIcon("repo", new vscode.ThemeColor("charts.blue"));
    } else if (element.role === "selected") {
      item.description = `${termIcon}${parts.join(" · ")}`;
      item.iconPath = new vscode.ThemeIcon("check", new vscode.ThemeColor("charts.purple"));
    } else {
      // Recent
      item.description = `${termIcon}${parts.join(" · ")}`;
      item.iconPath = new vscode.ThemeIcon("history", new vscode.ThemeColor("foreground"));
    }

    item.contextValue = "repo";
    (item as vscode.TreeItem & { path: string }).path = r.path;

    const lines = [
      r.path,
      `Branch: ${r.branch}`,
      r.totalChanges > 0 ? `Changes: ${r.totalChanges}` : "Clean",
    ];
    if (element.role === "active") lines.push("● Active repo");
    else if (element.role === "selected") lines.push("✓ Multi-selected");
    else lines.push("Recently opened");
    if (element.hasTerminal) lines.push("Terminal active");
    item.tooltip = lines.join("\n");

    // Click: select repo + show its terminal if one exists
    item.command = {
      command: CMD.viewDiff,
      title: "View Diff",
      arguments: [{ path: r.path }],
    };

    return item;
  }

  getChildren(): ActiveRepoNode[] {
    const nodes: ActiveRepoNode[] = [];
    const activePath = this.repoManager.selectedRepo;
    const multiPaths = this.repoManager.selectedRepoPaths;
    const recentPaths = this.repoManager.recentRepoPaths;
    const seen = new Set<string>();

    // Active repo first
    if (activePath) {
      const repo = this.repoManager.getRepo(activePath);
      if (repo) {
        nodes.push({ repo, role: "active", hasTerminal: hasActiveTerminal(activePath) });
        seen.add(activePath);
      }
    }

    // Multi-selected repos
    for (const p of multiPaths) {
      if (seen.has(p)) continue;
      const repo = this.repoManager.getRepo(p);
      if (repo) {
        nodes.push({ repo, role: "selected", hasTerminal: hasActiveTerminal(p) });
        seen.add(p);
      }
    }

    // Recent repos (not already shown)
    for (const p of recentPaths) {
      if (seen.has(p)) continue;
      const repo = this.repoManager.getRepo(p);
      if (repo) {
        nodes.push({ repo, role: "recent", hasTerminal: hasActiveTerminal(p) });
        seen.add(p);
      }
    }

    return nodes;
  }
}
