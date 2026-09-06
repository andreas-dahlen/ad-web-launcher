import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { loadVariables } from '../../variables/loadVariables.ts'

const createVariablesFile = (contents: string) => {
  const directory = mkdtempSync(
    path.join(tmpdir(), 'css-variable-completion-'),
  )

  const filePath = path.join(
    directory,
    'extension.generated.jsonc',
  )

  writeFileSync(filePath, contents)

  return {
    uri: { fsPath: filePath } as Parameters<
      typeof loadVariables
    >[0],
    cleanup: () =>
      rmSync(directory, {
        recursive: true,
        force: true,
      }),
  }
}

describe('[EXTENSION] loadVariables', () => {
  it('returns an empty array when the file cannot be read', () => {
    const uri = {
      fsPath: path.join(
        tmpdir(),
        'css-variable-completion-does-not-exist.jsonc',
      ),
    } as Parameters<typeof loadVariables>[0]

    expect(loadVariables(uri)).toEqual([])
  })

  it('loads an array of variables from JSONC', () => {
    const file = createVariablesFile(`
      [
        // Generated variables
        "--color-primary",
        "--color-secondary",
      ]
    `)

    try {
      expect(loadVariables(file.uri)).toEqual([
        '--color-primary',
        '--color-secondary',
      ])
    } finally {
      file.cleanup()
    }
  })

  it('throws when the file does not contain an array', () => {
    const file = createVariablesFile(`
      {
        "variable": "--color-primary"
      }
    `)

    try {
      expect(() => loadVariables(file.uri)).toThrow(
        'extension.generated.jsonc must contain an array',
      )
    } finally {
      file.cleanup()
    }
  })

  it('throws when the array contains non-string values', () => {
    const file = createVariablesFile(`
      [
        "--color-primary",
        42
      ]
    `)

    try {
      expect(() => loadVariables(file.uri)).toThrow(
        'extension.generated.jsonc must contain only strings',
      )
    } finally {
      file.cleanup()
    }
  })
})