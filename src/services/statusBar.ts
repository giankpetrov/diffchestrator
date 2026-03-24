import * as vscode from "vscode";
import * as path from "path";
import type { RepoManager } from "./repoManager";
import { CMD } from "../constants";

export class StatusBarManager implements vscode.Disposable {
  private _repoItem: vscode.StatusBarItem;
  private _activeItem: vscode.StatusBarItem;
  private _repoManager: RepoManager;
  private _disposables: vscode.Disposable[] = [];
  private _refreshTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(repoManager: RepoManager) {
    this._repoManager = repoManager;

    // Left item: repo summary (click → open sidebar)
    this._repoItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this._repoItem.command = "workbench.view.extension.diffchestrator";
    this._repoItem.show();

    // Right of it: active repo indicator (click → switch repo)
    this._activeItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      99
    );
    this._activeItem.command = CMD.switchRepo;
    this._activeItem.backgroundColor = new vscode.ThemeColor("statusBarItem.prominentBackground");
    // Don't show until a repo is selected
    this._activeItem.hide();

    this._refreshSummary();

    this._repoManager.onDidChangeRepos(
      () => this._refresh(),
      null,
      this._disposables
    );
    this._repoManager.onDidChangeSelection(
      () => this._refreshActive(),
      null,
      this._disposables
    );
  }

  showScanning(): void {
    this._repoItem.text = "$(loading~spin) Scanning...";
    this._repoItem.tooltip = "Diffchestrator: Scanning for repositories...";
  }

  private _refreshSummary(): void {
    const repos = this._repoManager.repos;
    const repoCount = repos.length;
    const changeCount = repos.reduce((sum, r) => sum + r.totalChanges, 0);

    if (repoCount === 0) {
      this._repoItem.text = "$(git-branch) Diffchestrator";
      this._repoItem.tooltip = "Click to open Diffchestrator sidebar";
    } else {
      this._repoItem.text = `$(git-branch) ${repoCount} repo${repoCount !== 1 ? "s" : ""}${changeCount > 0 ? `, ${changeCount} changes` : ""}`;
      this._repoItem.tooltip = `Diffchestrator: ${repoCount} repositories, ${changeCount} total changes\nClick to open sidebar`;
    }

    this._refreshActive();
  }

  private _refresh(): void {
    if (this._refreshTimer) return;
    this._refreshTimer = setTimeout(() => {
      this._refreshTimer = undefined;
      this._refreshSummary();
    }, 150);
  }

  private _refreshActive(): void {
    const selected = this._repoManager.selectedRepo;
    if (!selected) {
      this._activeItem.hide();
      return;
    }

    const repo = this._repoManager.repos.find((r) => r.path === selected);
    const name = path.basename(selected);
    const branch = repo?.branch ?? "";
    const changes = repo?.totalChanges ?? 0;

    this._activeItem.text = `$(repo) ${name}  $(git-branch) ${branch}${changes > 0 ? `  $(circle-filled) ${changes}` : ""}`;
    this._activeItem.tooltip = `Active repo: ${name}\nPath: ${selected}\nBranch: ${branch}\n${changes} change${changes !== 1 ? "s" : ""}\n\nClick to switch repo (Ctrl+Shift+R)`;
    this._activeItem.show();
  }

  dispose(): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    this._repoItem.dispose();
    this._activeItem.dispose();
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables = [];
  }
}
