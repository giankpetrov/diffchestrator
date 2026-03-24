import * as vscode from "vscode";
import * as path from "path";
import type { RepoManager } from "../services/repoManager";
import { CMD } from "../constants";

interface RootNode {
  label: string;
  rootPath: string;
}

export class ScanRootsProvider implements vscode.TreeDataProvider<RootNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<RootNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private repoManager: RepoManager) {
    // Refresh when config changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("diffchestrator.scanRoots")) {
        this._onDidChangeTreeData.fire();
      }
    });

    // Refresh when scan completes (to update active indicator)
    repoManager.onDidChangeRepos(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  getTreeItem(element: RootNode): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    const isActive = element.rootPath === this.repoManager.currentRoot;

    item.id = `root:${element.rootPath}:${isActive ? "active" : "idle"}`;
    item.tooltip = element.rootPath;
    item.contextValue = "scanRoot";

    if (isActive) {
      item.description = "● active";
      item.iconPath = new vscode.ThemeIcon("folder-opened", new vscode.ThemeColor("charts.blue"));
    } else {
      item.iconPath = new vscode.ThemeIcon("folder", new vscode.ThemeColor("foreground"));
    }

    item.command = {
      command: CMD.switchRoot,
      title: "Switch Root",
      arguments: [element.rootPath],
    };

    return item;
  }

  getChildren(element?: RootNode): RootNode[] {
    if (element) return [];

    const config = vscode.workspace.getConfiguration("diffchestrator");
    const roots = config.get<string[]>("scanRoots", []);

    return roots.map((rootPath) => ({
      label: path.basename(rootPath),
      rootPath,
    }));
  }
}
