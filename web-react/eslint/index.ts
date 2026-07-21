import noTestOnlyApi from './testApi/no-test-only-api.ts';
import noInvalidPrefixes from './tokens/no-invalid-prefixes-relations.ts';

export default {
  rules: {
    'no-test-only-api': noTestOnlyApi,
    'no-invalid-prefix-relations': noInvalidPrefixes
  }
}