import noTestOnlyApi from './custom/testApi/no-test-only-api.ts';
import noInvalidPrefixes from './custom/tokens/no-invalid-prefixes-relations.ts'

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-invalid-prefix-relations': noInvalidPrefixes
  }
}