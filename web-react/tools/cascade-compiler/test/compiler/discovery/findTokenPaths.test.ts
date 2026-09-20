import { describe, expect, it } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { findTokenPaths } from '../../../src/compiler/discovery/findTokenPaths.ts'

function createTempDir() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), "token-test-")
  )
}

function createFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, "{}")
}

describe('[COMPILER]', () => {
  describe("findTokenPaths", () => {
    it("finds json and jsonc files in a directory", () => {
      const dir = createTempDir()

      createFile(path.join(dir, "button.json"))
      createFile(path.join(dir, "slider.jsonc"))
      createFile(path.join(dir, "ignored.txt"))

      const result = findTokenPaths(dir)

      expect(result).toEqual({
        tokenPaths: [
          path.join(dir, "button.json"),
          path.join(dir, "slider.jsonc"),
        ],
        issues: [],
      })
    })

    it("finds token files recursively", () => {
      const dir = createTempDir()

      createFile(
        path.join(dir, "components", "button.json")
      )

      createFile(
        path.join(dir, "components", "slider.jsonc")
      )

      const result = findTokenPaths(dir)

      expect(result).toEqual({
        tokenPaths: [
          path.join(dir, "components", "button.json"),
          path.join(dir, "components", "slider.jsonc"),
        ],
        issues: [],
      })
    })

    it("returns a single token file when given a file path", () => {
      const dir = createTempDir()
      const file = path.join(dir, "button.json")

      createFile(file)

      const result = findTokenPaths(file)

      expect(result).toEqual({
        tokenPaths: [file],
        issues: [],
      })
    })

    it("sorts paths alphabetically", () => {
      const dir = createTempDir()

      createFile(path.join(dir, "z.json"))
      createFile(path.join(dir, "a.json"))
      createFile(path.join(dir, "m.json"))

      const result = findTokenPaths(dir)

      expect(result).toEqual({
        tokenPaths: [
          path.join(dir, "a.json"),
          path.join(dir, "m.json"),
          path.join(dir, "z.json"),
        ],
        issues: [],
      })
    })

    it("returns no token paths when the directory contains no token files", () => {
      const dir = createTempDir()

      createFile(path.join(dir, "ignored.txt"))
      createFile(path.join(dir, "README.md"))

      const result = findTokenPaths(dir)

      expect(result).toEqual({
        tokenPaths: [],
        issues: [],
      })
    })

    it("returns an issue when the token path cannot be resolved", () => {
      const dir = createTempDir()
      const missingPath = path.join(dir, "missing")

      const result = findTokenPaths(missingPath)

      expect(result.tokenPaths).toEqual([])
      expect(result.issues).toHaveLength(1)

      expect(result.issues[0]).toMatchObject({
        subject: "Token Path resolution",
        issues: [
          {
            path: missingPath,
            value: expect.stringContaining("ENOENT"),
            reason: "couldn't resolve tokenPath",
          },
        ],
      })
    })

    it("returns an issue when a directory cannot be read", () => {
      const dir = createTempDir()

      const originalReaddirSync = fs.readdirSync

      fs.readdirSync = (() => {
        throw new Error("read failure")
      }) as typeof fs.readdirSync

      try {
        const result = findTokenPaths(dir)

        expect(result.tokenPaths).toEqual([])
        expect(result.issues).toHaveLength(1)

        expect(result.issues[0]).toMatchObject({
          subject: "Token Path resolution",
          issues: [
            {
              path: dir,
              value: "Error: read failure",
              reason: "wouldn't read tokenFilePath",
            },
          ],
        })
      } finally {
        fs.readdirSync = originalReaddirSync
      }
    })
  })
})