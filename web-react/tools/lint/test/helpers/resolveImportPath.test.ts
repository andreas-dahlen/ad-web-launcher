import fs from 'node:fs'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { resolveImportPath } from '../../oxlint-plugins/helpers/resolveImportPath.ts'

const projectRoot = path.resolve(
  import.meta.dirname,
  '__fixtures__/resolve-import-path',
)

const importerPath = path.join(
  projectRoot,
  'src/components/foo.ts',
)

beforeAll(() => {
  fs.mkdirSync(projectRoot, { recursive: true })

  fs.writeFileSync(
    path.join(projectRoot, 'tsconfig.paths.json'),
    `{
      // JSONC is intentional
      "compilerOptions": {
        "paths": {
          "@/*": ["src/*"],
          "@components/*": ["src/components/*"],
          "@exact": ["src/exact.ts"]
        }
      }
    }`,
  )
})

afterAll(() => {
  fs.rmSync(projectRoot, { recursive: true, force: true })
})

describe('resolveImportPath', () => {
  it('resolves relative imports', () => {
    expect(
      resolveImportPath(
        './thing.ts',
        importerPath,
        projectRoot,
      ),
    ).toBe(
      path.join(projectRoot, 'src/components/thing.ts'),
    )
  })

  it('resolves parent relative imports', () => {
    expect(
      resolveImportPath(
        '../thing.tsx',
        importerPath,
        projectRoot,
      ),
    ).toBe(
      path.join(projectRoot, 'src/thing.tsx'),
    )
  })

  it('resolves wildcard aliases', () => {
    expect(
      resolveImportPath(
        '@/utils/foo.ts',
        importerPath,
        projectRoot,
      ),
    ).toBe(
      path.join(projectRoot, 'src/utils/foo.ts'),
    )
  })

  it('resolves more specific aliases', () => {
    expect(
      resolveImportPath(
        '@components/Button.tsx',
        importerPath,
        projectRoot,
      ),
    ).toBe(
      path.join(projectRoot, 'src/components/Button.tsx'),
    )
  })

  it('resolves non-wildcard aliases', () => {
    expect(
      resolveImportPath(
        '@exact',
        importerPath,
        projectRoot,
      ),
    ).toBe(
      path.join(projectRoot, 'src/exact.ts'),
    )
  })

  it('returns undefined for unknown aliases', () => {
    expect(
      resolveImportPath(
        '@unknown/foo.ts',
        importerPath,
        projectRoot,
      ),
    ).toBeUndefined()
  })

  it('returns undefined when paths are missing', () => {
    const emptyRoot = path.join(projectRoot, 'empty')

    fs.mkdirSync(emptyRoot)

    expect(
      resolveImportPath(
        '@/foo.ts',
        importerPath,
        emptyRoot,
      ),
    ).toBeUndefined()
  })
})