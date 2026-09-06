import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it, vi } from 'vitest'

vi.mock(
  '../src/internalImports-ox/helpers/getInternalAliases.ts',
  () => ({
    getInternalAliases: vi.fn(() => ['@/']),
  }),
)

import rule from '../src/internalImports-ox/no-internal-import-extensions.ts'

const ruleTester = new RuleTester()

describe('[OXLINT] no-internal-import-extensions', () => {
  it('requires extensions on internal imports', () => {
    ruleTester.run('no-internal-import-extensions', rule, {
      valid: [
        {
          code: `import foo from '@/foo.ts'`,
          filename: 'src/foo.ts',
        },
        {
          code: `import foo from '@/foo.tsx'`,
          filename: 'src/foo.ts',
        },
        {
          code: `import foo from './foo'`,
          filename: 'src/foo.ts',
        },
        {
          code: `import * as foo from '@/foo'`,
          filename: 'src/foo.ts',
        },
      ],
      invalid: [
        {
          code: `import foo from '@/foo'`,
          filename: 'src/foo.ts',
          errors: [
            {
              message: '@ imports need to end with .ts or .tsx',
            },
          ],
        },
      ],
    })
  })
})