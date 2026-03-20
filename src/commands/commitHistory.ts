import * as vscode from "vscode";
import * as path from "path";
import { GitExecutor } from "../git/gitExecutor";
import type { RepoManager } from "../services/repoManager";
import { CMD } from "../constants";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

export function registerCommitHistoryCommands(
  context: vscode.ExtensionContext,
  repoManager: RepoManager
): void {
  const git = new GitExecutor();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CMD.commitHistory,
      async (item?: any) => {
        const repoPath =
          item?.repo?.path ?? item?.fullPath ?? item?.path ?? repoManager.selectedRepo;
        if (!repoPath) {
          vscode.window.showWarningMessage(
            "Diffchestrator: No repository selected."
          );
          return;
        }

        const repoName = path.basename(repoPath);

        try {
          const commits = await git.log(repoPath, 15);
          if (commits.length === 0) {
            vscode.window.showInformationMessage(
              `Diffchestrator: No commits found in ${repoName}.`
            );
            return;
          }

          const items = commits.map((c) => ({
            label: `$(git-commit) ${c.shortHash}  ${c.message}`,
            description: `${c.author}, ${timeAgo(c.date)}`,
            detail: c.hash,
            _hash: c.hash,
            _repoPath: repoPath,
          }));

          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Commit history for ${repoName}`,
            matchOnDescription: true,
            matchOnDetail: true,
          });

          if (selected) {
            const uri = vscode.Uri.parse(
              `git-show:${repoName}/${selected._hash.slice(0, 8)}`
            ).with({
              query: JSON.stringify({
                path: "",
                ref: selected._hash,
                repoPath: selected._repoPath,
                fullShow: true,
              }),
            });

            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: true });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(
            `Diffchestrator: Failed to get commit history: ${msg}`
          );
        }
      }
    )
  );
}
