import type { OxlintConfig } from 'oxlint'

export const jsPlugins: OxlintConfig['jsPlugins'] = [
  {
    name: 'boundaries',
    specifier: 'eslint-plugin-boundaries',
  },
  {
    name: 'test-api',
    specifier: './tools/lint/oxlint-plugins/testApi-ox/no-test-only-api-plugin.ts',
  },
  {
    name: 'internal-imports',
    specifier: './tools/lint/oxlint-plugins/internalImports-ox/no-internal-import-extensions-plugin.ts',
  },
  {
    name: 'existing-imports',
    specifier: './tools/lint/oxlint-plugins/importExists-ox/no-nonexistent-import-extensions-plugin.ts'
  }
]