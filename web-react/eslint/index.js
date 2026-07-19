import noTestOnlyApi from './rules/no-test-only-api.js';
import noInvalidPrefixes from './rules/tokens/no-invalid-prefixes.js';

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-invalid-prefix-relations': noInvalidPrefixes
  }
}