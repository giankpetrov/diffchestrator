import * as assert from "node:assert";
import { test } from "node:test";
import { escapeTextForShell } from "./shellEscape.ts";

test("escapeTextForShell", () => {
    // PowerShell
    assert.strictEqual(escapeTextForShell("hello", "powershell"), "'hello'");
    assert.strictEqual(escapeTextForShell("hello 'world'", "pwsh"), "'hello ''world'''");

    // Windows CMD
    assert.strictEqual(escapeTextForShell("hello", "cmd.exe"), "\"hello\"");
    assert.strictEqual(escapeTextForShell("hello \"world\"", "cmd.exe"), "\"hello \"\"world\"\"\"");

    // POSIX
    assert.strictEqual(escapeTextForShell("hello", "bash"), "'hello'");
    assert.strictEqual(escapeTextForShell("hello 'world'", "zsh"), "'hello '\\''world'\\'''");
});
