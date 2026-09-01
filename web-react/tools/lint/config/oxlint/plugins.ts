import type { OxlintConfig } from 'oxlint'

export const jsPlugins: OxlintConfig['jsPlugins'] = [
  {
    name: 'boundaries',
    specifier: 'eslint-plugin-boundaries',
  },
]