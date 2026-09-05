import type { OxlintConfig } from 'oxlint'

export const jsPlugins: OxlintConfig['jsPlugins'] = [
  {
    name: 'boundaries',
    specifier: 'eslint-plugin-boundaries',
  },
  {
    name: 'test-api',
    specifier: './tools/lint/custom/testApi-ox/no-test-only-api-plugin.ts',
  },
  {
    name: 'internal-imports',
    specifier: './tools/lint/custom/internalImports-ox/no-internal-import-extensions-plugin.ts',
  },
]