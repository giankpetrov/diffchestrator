import * as vscode from "vscode";
import * as path from "path";
import type { RepoManager } from "../services/repoManager";
import { CMD } from "../constants";
import { registerRepoTerminal, getRepoTerminal, validateCli, terminalIcon } from "./terminal";
import { escapeForTerminal } from "../utils/shell";
import { resolveRepoPath } from "../utils/fileItem";

export function registerClaudeCommands(
  context: vscode.ExtensionContext,
  repoManager: RepoManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CMD.openClaudeCode,
      async (item?: any) => {
        if (!(await validateCli("claude"))) return;

        const selectedPaths = repoManager.selectedRepoPaths;
        const singlePath = resolveRepoPath(item, repoManager.selectedRepo);

        if (selectedPaths.size > 1) {
          // Multi-repo mode: open claude with --add-dir for each selected repo
          const addDirArgs = [...selectedPaths]
            .map((p) => `--add-dir ${escapeForTerminal(p)}`)
            .join(" ");

          const terminal = vscode.window.createTerminal({
            name: "Multi-repo",
            cwd: repoManager.currentRoot,
            iconPath: terminalIcon("claude"),
          });
          terminal.show();
          terminal.sendText(`claude ${addDirArgs}`);
        } else if (singlePath) {
          if (!repoManager.getRepo(singlePath)) {
            repoManager.addDirectoryPath(singlePath);
          } else {
            repoManager.selectRepo(singlePath);
          }
          // Reuse existing Claude terminal if alive
          const existing = getRepoTerminal(singlePath, "claude");
          if (existing) {
            existing.show();
            return;
          }

          const repoName = path.basename(singlePath);
          const terminal = vscode.window.createTerminal({
            name: repoName,
            cwd: singlePath,
            iconPath: terminalIcon("claude"),
          });
          registerRepoTerminal(singlePath, "claude", terminal);
          terminal.show();
          terminal.sendText("claude -c 2>/dev/null || claude");
        } else {
          vscode.window.showWarningMessage(
            "Diffchestrator: No repository selected. Select a repo first."
          );
        }
      }
    )
  );

  // Claude (new session) — always starts fresh, never continues
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CMD.openClaudeCodeNew,
      async (item?: any) => {
        if (!(await validateCli("claude"))) return;

        const selectedPaths = repoManager.selectedRepoPaths;
        const singlePath = resolveRepoPath(item, repoManager.selectedRepo);

        if (selectedPaths.size > 1) {
          const addDirArgs = [...selectedPaths]
            .map((p) => `--add-dir ${escapeForTerminal(p)}`)
            .join(" ");

          const terminal = vscode.window.createTerminal({
            name: "Multi-repo",
            cwd: repoManager.currentRoot,
            iconPath: terminalIcon("claudenew"),
          });
          terminal.show();
          terminal.sendText(`claude ${addDirArgs}`);
        } else if (singlePath) {
          if (!repoManager.getRepo(singlePath)) {
            repoManager.addDirectoryPath(singlePath);
          } else {
            repoManager.selectRepo(singlePath);
          }
          const existing = getRepoTerminal(singlePath, "claudenew");
          if (existing) {
            existing.show();
            return;
          }

          const repoName = path.basename(singlePath);
          const terminal = vscode.window.createTerminal({
            name: repoName,
            cwd: singlePath,
            iconPath: terminalIcon("claudenew"),
          });
          registerRepoTerminal(singlePath, "claudenew", terminal);
          terminal.show();
          terminal.sendText("claude");
        } else {
          vscode.window.showWarningMessage(
            "Diffchestrator: No repository selected. Select a repo first."
          );
        }
      }
    )
  );
}
