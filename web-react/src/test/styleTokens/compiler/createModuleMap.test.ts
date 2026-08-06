import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createModuleMap } from "@styleTokens/compiler/discovery/createModuleMap";

function createTempDir() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), "module-map-test-")
  );
}

function createFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, "");
}

describe("createModuleMap", () => {
  const originalCwd = process.cwd();

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it("maps token groups to matching css modules", () => {
    const root = createTempDir();

    createFile(
      path.join(root, "src", "components", "button", "Button.module.css")
    );

    createFile(
      path.join(root, "src", "components", "slider", "Slider.module.css")
    );

    process.chdir(root);

    const result = createModuleMap([
      path.join(root, "tokens", "button.json"),
      path.join(root, "tokens", "slider"),
    ]);

    expect(result).toEqual(
      new Map([
        [
          path.join(root, "tokens", "button.json"),
          path.join(
            root,
            "src",
            "components",
            "button",
            "Button.module.css"
          ),
        ],
        [
          path.join(root, "tokens", "slider"),
          path.join(
            root,
            "src",
            "components",
            "slider",
            "Slider.module.css"
          ),
        ],
      ])
    );
  });

  it("ignores css modules without matching token groups", () => {
    const root = createTempDir();

    createFile(
      path.join(root, "src", "components", "button", "Button.module.css")
    );

    createFile(
      path.join(root, "src", "components", "unused", "Unused.module.css")
    );

    process.chdir(root);

    const result = createModuleMap([
      path.join(root, "tokens", "button.json"),
    ]);

    expect(result.size).toBe(1);
    expect(result.has(
      path.join(root, "tokens", "button.json")
    )).toBe(true);
  });

  it("matches css module names case insensitively", () => {
    const root = createTempDir();

    createFile(
      path.join(root, "src", "Button", "BUTTON.module.css")
    );

    process.chdir(root);

    const result = createModuleMap([
      path.join(root, "tokens", "button.json"),
    ]);

    expect(result.get(
      path.join(root, "tokens", "button.json")
    )).toBe(
      path.join(root, "src", "Button", "BUTTON.module.css")
    );
  });
});