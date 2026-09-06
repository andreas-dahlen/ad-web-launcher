import type { OxlintConfig } from 'oxlint'

export const jsPlugins: OxlintConfig['jsPlugins'] = [
  {
    name: 'boundaries',
    specifier: 'eslint-plugin-boundaries',
  },
  {
    name: 'test-api',
    specifier: './tools/lint/src/testApi-ox/no-test-only-api-plugin.ts',
  },
  {
    name: 'internal-imports',
    specifier: './tools/lint/src/internalImports-ox/no-internal-import-extensions-plugin.ts',
  },
]