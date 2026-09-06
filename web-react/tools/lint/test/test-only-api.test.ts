import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import rule from '../src/testApi-ox/no-test-only-api.ts'

const ruleTester = new RuleTester()

describe('[OXLINT] no-test-only-api', () => {
  it('enforces test-only API imports', () => {
    ruleTester.run('no-test-only-api', rule, {
      valid: [
        {
          code: `import { __TEST_ONLY_API } from './testApi'`,
          filename: 'src/test/foo.test.ts',
        },
        {
          code: `import { something } from './module'`,
          filename: 'src/foo.ts',
        },
      ],
      invalid: [
        {
          code: `import { __TEST_ONLY_API } from './testApi'`,
          filename: 'src/foo.ts',
          errors: [
            {
              message: '__TEST_ONLY_API is only available in test files',
            },
          ],
        },
        {
          code: `import { __TEST_ONLY_API as testApi } from './testApi'`,
          filename: 'src/foo.ts',
          errors: [
            {
              message: '__TEST_ONLY_API is only available in test files',
            },
          ],
        },
      ],
    })
  })
})