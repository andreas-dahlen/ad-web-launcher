import noTestOnlyApi from './testApi/no-test-only-api';
import noInvalidPrefixes from './tokens/no-invalid-prefixes-relations'

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-invalid-prefix-relations': noInvalidPrefixes
  }
}