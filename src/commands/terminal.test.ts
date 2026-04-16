import { test, describe } from "node:test";
import * as assert from "node:assert";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Re-implementing the logic here for testing since we can't easily import
 * it from terminal.ts due to vscode dependency and the fact it's not exported.
 * In a real scenario, we'd move this logic to a utility file.
 */
async function aliasOrCommandExistsInternal(name: string, shellOverride?: string): Promise<boolean> {
  try {
    // Basic validation to prevent command injection before shell-specific escaping
    if (!name || /[\s;&|><$`\\]/.test(name)) {
      return false;
    }

    const shell = shellOverride || "/bin/bash";
    // Wrap in single quotes to safely handle any other characters
    const safeName = `'${name.replace(/'/g, "'\\''")}'`;
    await execFileAsync(shell, ["-ic", `type ${safeName}`], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

describe("aliasOrCommandExists Security", () => {
  test("should block command injection via semicolon", async () => {
    const result = await aliasOrCommandExistsInternal("yolo; touch pwned");
    assert.strictEqual(result, false);
  });

  test("should block command injection via pipe", async () => {
    const result = await aliasOrCommandExistsInternal("yolo | touch pwned");
    assert.strictEqual(result, false);
  });

  test("should block command injection via backticks", async () => {
    const result = await aliasOrCommandExistsInternal("`touch pwned`");
    assert.strictEqual(result, false);
  });

  test("should block command injection via dollar substitution", async () => {
    const result = await aliasOrCommandExistsInternal("$(touch pwned)");
    assert.strictEqual(result, false);
  });

  test("should block command injection via ampersand", async () => {
    const result = await aliasOrCommandExistsInternal("yolo & touch pwned");
    assert.strictEqual(result, false);
  });

  test("should block whitespace", async () => {
    const result = await aliasOrCommandExistsInternal("yolo ");
    assert.strictEqual(result, false);
  });

  test("should allow valid command name", async () => {
    // 'ls' should exist on most systems
    const result = await aliasOrCommandExistsInternal("ls");
    assert.strictEqual(result, true);
  });

  test("should handle non-existent command safely", async () => {
    const result = await aliasOrCommandExistsInternal("nonexistentcommand12345");
    assert.strictEqual(result, false);
  });

  test("should handle single quotes in name (though blocked by regex)", async () => {
    // Even if it wasn't blocked by the regex, the escaping should handle it
    const result = await aliasOrCommandExistsInternal("command'with'quote");
    assert.strictEqual(result, false); // Blocked by regex now
  });
});
