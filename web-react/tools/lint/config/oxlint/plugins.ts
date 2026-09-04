import type { OxlintConfig } from 'oxlint'

// export const jsPlugins: OxlintConfig['jsPlugins'] = [
//   // {
//   //   name: 'boundaries',
//   //   specifier: 'eslint-plugin-boundaries',
//   // },
//   {
//     name: 'custom',
//     specifier: './tools/lint/custom/index.ts',
//   },
// ]

export const jsPlugins = [
  {
    name: 'test-api',
    specifier: './tools/lint/custom/testApi-ox/no-test-only-api-plugin.ts',
  },
  {
    name: 'internal-imports',
    specifier: './tools/lint/custom/internalImports/no-internal-import-extensions-plugin.ts',
  },
]