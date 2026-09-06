import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { getInternalAliases } from '../src/internalImports-ox/helpers/getInternalAliases.ts'

const createTempProject = (config?: string) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'lint-test-'))

  if (config !== undefined) {
    writeFileSync(
      path.join(cwd, 'tsconfig.paths.json'),
      config,
    )
  }

  return cwd
}

const cleanup = (cwd: string) => {
  rmSync(cwd, { recursive: true, force: true })
}

describe('[OXLINT] getInternalAliases', () => {
  it('returns an empty array when tsconfig.paths.json does not exist', () => {
    const cwd = createTempProject()

    try {
      expect(getInternalAliases(cwd)).toEqual([])
    } finally {
      cleanup(cwd)
    }
  })

  it('returns an empty array when compilerOptions.paths is missing', () => {
    const cwd = createTempProject(`
      {
        "compilerOptions": {}
      }
    `)

    try {
      expect(getInternalAliases(cwd)).toEqual([])
    } finally {
      cleanup(cwd)
    }
  })

  it('returns aliases from compilerOptions.paths', () => {
    const cwd = createTempProject(`
      {
        "compilerOptions": {
          "paths": {
            "@/*": ["src/*"],
            "@components/*": ["src/components/*"],
            "@config": ["src/config.ts"]
          }
        }
      }
    `)

    try {
      expect(getInternalAliases(cwd)).toEqual([
        '@/',
        '@components/',
        '@config',
      ])
    } finally {
      cleanup(cwd)
    }
  })

  it('supports JSONC configuration', () => {
    const cwd = createTempProject(`
      {
        // Internal aliases
        "compilerOptions": {
          "paths": {
            "@/*": ["src/*"],
          },
        },
      }
    `)

    try {
      expect(getInternalAliases(cwd)).toEqual(['@/'])
    } finally {
      cleanup(cwd)
    }
  })
})