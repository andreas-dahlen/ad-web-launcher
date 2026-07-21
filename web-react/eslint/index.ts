import noTestOnlyApi from './testApi/no-test-only-api.js';
import noInvalidPrefixes from './tokens/no-invalid-prefixes-relations.js';

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-invalid-prefix-relations': noInvalidPrefixes
  }
}