import * as vscode from "vscode";
import { GitExecutor } from "../git/gitExecutor";
import type { RepoManager } from "../services/repoManager";
import { CMD } from "../constants";

/**
 * Extract repoPath and filePath from various argument shapes:
 * - FileNode from tree: { type: "file", repoPath: "...", fileChange: { path: "..." } }
 * - TreeItem with attached props: { repoPath: "...", filePath: "..." }
 */
function resolveFileItem(item: any): { repoPath: string; filePath: string } | undefined {
  const repoPath = item?.repoPath;
  const filePath = item?.fileChange?.path ?? item?.filePath;
  if (repoPath && filePath) return { repoPath, filePath };
  return undefined;
}

export function registerStageCommands(
  context: vscode.ExtensionContext,
  repoManager: RepoManager
): void {
  const git = new GitExecutor();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CMD.stageFile,
      async (item?: any) => {
        const resolved = resolveFileItem(item);
        if (!resolved) {
          vscode.window.showWarningMessage("Diffchestrator: No file selected.");
          return;
        }
        try {
          await git.stage(resolved.repoPath, [resolved.filePath]);
          await repoManager.refreshRepo(resolved.repoPath);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Diffchestrator: Failed to stage file: ${msg}`);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CMD.unstageFile,
      async (item?: any) => {
        const resolved = resolveFileItem(item);
        if (!resolved) {
          vscode.window.showWarningMessage("Diffchestrator: No file selected.");
          return;
        }
        try {
          await git.unstage(resolved.repoPath, [resolved.filePath]);
          await repoManager.refreshRepo(resolved.repoPath);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Diffchestrator: Failed to unstage file: ${msg}`);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.stageAll, async () => {
      const repoPath = repoManager.selectedRepo;
      if (!repoPath) {
        vscode.window.showWarningMessage("Diffchestrator: No repository selected.");
        return;
      }
      try {
        const status = await git.status(repoPath);
        const files = [
          ...status.unstaged.map((f) => f.path),
          ...status.untracked.map((f) => f.path),
        ];
        if (files.length === 0) {
          vscode.window.showInformationMessage("Diffchestrator: Nothing to stage.");
          return;
        }
        await git.stage(repoPath, files);
        await repoManager.refreshRepo(repoPath);
        vscode.window.showInformationMessage(
          `Diffchestrator: Staged ${files.length} file${files.length === 1 ? "" : "s"}`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Diffchestrator: Failed to stage all: ${msg}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.unstageAll, async () => {
      const repoPath = repoManager.selectedRepo;
      if (!repoPath) {
        vscode.window.showWarningMessage("Diffchestrator: No repository selected.");
        return;
      }
      try {
        const status = await git.status(repoPath);
        const files = status.staged.map((f) => f.path);
        if (files.length === 0) {
          vscode.window.showInformationMessage("Diffchestrator: Nothing to unstage.");
          return;
        }
        await git.unstage(repoPath, files);
        await repoManager.refreshRepo(repoPath);
        vscode.window.showInformationMessage(
          `Diffchestrator: Unstaged ${files.length} file${files.length === 1 ? "" : "s"}`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Diffchestrator: Failed to unstage all: ${msg}`);
      }
    })
  );
}
