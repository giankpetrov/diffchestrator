import type { ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { escapeTextForShell } from "./shellEscape";

/**
 * Escapes a string to be safely used as a command line argument
 * in the VS Code integrated terminal, regardless of the user's shell.
 */
export function escapeForTerminal(text: string): string {
  // Try to determine the shell from VS Code environment
  const shell = (vscode.env.shell || "").toLowerCase();
  return escapeTextForShell(text, shell);
}
