import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import type { RepoManager } from "./repoManager";

/**
 * Auto-scan for git repos when workspace folders change or on startup
 * if no scanRoots are configured.
 */
export class WorkspaceAutoScan implements vscode.Disposable {
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private _repoManager: RepoManager,
    private _fileWatcher: { watchAll(): void },
  ) {
    // Listen for workspace folder changes
    this._disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders((e) => {
        for (const folder of e.added) {
          this._checkAndOfferScan(folder.uri.fsPath);
        }
      })
    );

    // On startup: if scanRoots is empty, check workspace folders
    this._autoScanOnStartup();
  }

  private async _autoScanOnStartup(): Promise<void> {
    const config = vscode.workspace.getConfiguration("diffchestrator");
    const roots = config.get<string[]>("scanRoots", []);

    if (roots.length > 0) return; // Already configured

    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return;

    // Check each workspace folder for git repos
    for (const folder of folders) {
      const hasGit = this._containsGitRepo(folder.uri.fsPath);
      if (hasGit) {
        const answer = await vscode.window.showInformationMessage(
          `Diffchestrator: Workspace folder "${folder.name}" contains git repos. Add it to scan roots?`,
          "Yes",
          "No"
        );

        if (answer === "Yes") {
          const current = config.get<string[]>("scanRoots", []);
          if (!current.includes(folder.uri.fsPath)) {
            await config.update(
              "scanRoots",
              [...current, folder.uri.fsPath],
              vscode.ConfigurationTarget.Global
            );
          }
          await this._repoManager.scan(folder.uri.fsPath);
          this._fileWatcher.watchAll();
        }
      }
    }
  }

  private async _checkAndOfferScan(folderPath: string): Promise<void> {
    const hasGit = this._containsGitRepo(folderPath);
    if (!hasGit) return;

    const answer = await vscode.window.showInformationMessage(
      `Diffchestrator: New folder "${path.basename(folderPath)}" contains git repos. Add to scan roots?`,
      "Yes",
      "No"
    );

    if (answer === "Yes") {
      const config = vscode.workspace.getConfiguration("diffchestrator");
      const current = config.get<string[]>("scanRoots", []);
      if (!current.includes(folderPath)) {
        await config.update(
          "scanRoots",
          [...current, folderPath],
          vscode.ConfigurationTarget.Global
        );
      }
      await this._repoManager.scan(folderPath);
      this._fileWatcher.watchAll();
    }
  }

  /**
   * Check if a directory or its immediate children contain a .git folder.
   * Only looks 2 levels deep to keep it fast.
   */
  private _containsGitRepo(dirPath: string): boolean {
    // Check the directory itself
    if (fs.existsSync(path.join(dirPath, ".git"))) return true;

    // Check one level of children
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          const childGit = path.join(dirPath, entry.name, ".git");
          if (fs.existsSync(childGit)) return true;
        }
      }
    } catch {
      /* permission denied etc */
    }
    return false;
  }

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables = [];
  }
}
