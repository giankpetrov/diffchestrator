import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import type { RepoManager } from "../services/repoManager";

export interface RepoExplorerItem {
  uri: vscode.Uri;
  isDirectory: boolean;
}

export class RepoExplorerProvider implements vscode.TreeDataProvider<RepoExplorerItem>, vscode.Disposable {
  private _onDidChangeTreeData = new vscode.EventEmitter<RepoExplorerItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private _disposables: vscode.Disposable[] = [];

  constructor(private repoManager: RepoManager) {
    this._disposables.push(repoManager.onDidChangeSelection(() => {
      this._onDidChangeTreeData.fire();
    }));
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose();
    for (const d of this._disposables) d.dispose();
    this._disposables = [];
  }

  getTreeItem(element: RepoExplorerItem): vscode.TreeItem {
    const item = new vscode.TreeItem(
      element.uri,
      element.isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    if (element.isDirectory) {
      item.contextValue = "directory";
    } else {
      item.contextValue = "file";
      item.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [element.uri],
      };
    }

    return item;
  }

  async getChildren(element?: RepoExplorerItem): Promise<RepoExplorerItem[]> {
    if (!element) {
      // Root level
      const repoPath = this.repoManager.selectedRepo;
      if (!repoPath) return [];
      return this._readDirectory(repoPath);
    }
    return this._readDirectory(element.uri.fsPath);
  }

  private async _readDirectory(dirPath: string): Promise<RepoExplorerItem[]> {
    try {
      const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true });

      const dirs: RepoExplorerItem[] = [];
      const files: RepoExplorerItem[] = [];

      for (const d of dirents) {
        if (d.name === ".git") continue; // Hide .git folder

        const uri = vscode.Uri.file(path.join(dirPath, d.name));
        const item: RepoExplorerItem = {
          uri,
          isDirectory: d.isDirectory()
        };

        if (item.isDirectory) {
          dirs.push(item);
        } else {
          files.push(item);
        }
      }

      dirs.sort((a, b) => path.basename(a.uri.fsPath).localeCompare(path.basename(b.uri.fsPath)));
      files.sort((a, b) => path.basename(a.uri.fsPath).localeCompare(path.basename(b.uri.fsPath)));

      return [...dirs, ...files];
    } catch {
      return [];
    }
  }
}
