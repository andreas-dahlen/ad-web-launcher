import noTestOnlyApi from './testApi-ox/no-test-only-api.ts'
import noInternalImportExtensions from './internalImports/no-internal-import-extensions.ts'

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-internal-import-extensions': noInternalImportExtensions
  },
}