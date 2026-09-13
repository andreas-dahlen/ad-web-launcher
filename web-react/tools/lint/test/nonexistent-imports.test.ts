import fs from 'node:fs'
import path from 'node:path'

import { RuleTester } from 'oxlint/plugins-dev'
import { afterAll, beforeAll, describe, it, vi } from 'vitest'

const fixtureRoot = path.resolve(
  import.meta.dirname,
  '__fixtures__/import-exists',
)

beforeAll(() => {
  fs.mkdirSync(fixtureRoot, { recursive: true })

  fs.writeFileSync(
    path.join(fixtureRoot, 'foo.ts'),
    '',
  )

  fs.writeFileSync(
    path.join(fixtureRoot, 'component.tsx'),
    '',
  )
})

afterAll(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
})

vi.mock(
  '../src/helpers/getInternalAliases.ts',
  () => ({
    getInternalAliases: vi.fn(() => ['@/']),
  }),
)

vi.mock(
  '../src/helpers/resolveProjectRoot.ts',
  () => ({
    resolveProjectRoot: vi.fn(() => fixtureRoot),
  }),
)

import rule from '../src/importExists-ox/no-nonexistent-import-extensions.ts'

const ruleTester = new RuleTester()

describe('[OXLINT] no-nonexistent-import-extensions', () => {
  it('requires explicitly referenced files to exist', () => {
    ruleTester.run('no-nonexistent-import-extensions', rule, {
      valid: [
        {
          code: `import foo from './foo.ts'`,
          filename: path.join(fixtureRoot, 'index.ts'),
        },
        {
          code: `import Component from './component.tsx'`,
          filename: path.join(fixtureRoot, 'index.ts'),
        },
        {
          code: `import foo from './foo'`,
          filename: path.join(fixtureRoot, 'index.ts'),
        },
        {
          code: `import foo from 'some-package'`,
          filename: path.join(fixtureRoot, 'index.ts'),
        },
      ],

      invalid: [
        {
          code: `import foo from './foo.tsx'`,
          filename: path.join(fixtureRoot, 'index.ts'),
          errors: [
            {
              message: `Imported file does not exist: ./foo.tsx`,
            },
          ],
        },
        {
          code: `import Component from './component.ts'`,
          filename: path.join(fixtureRoot, 'index.ts'),
          errors: [
            {
              message: `Imported file does not exist: ./component.ts`,
            },
          ],
        },
      ],
    })
  })
})