import type { OxlintConfig } from 'oxlint'
export const typeAwareRules = {
  'typescript/no-floating-promises': [
    'error',
    { ignoreVoid: true },
  ],
  'typescript/no-misused-promises': 'error',
} satisfies OxlintConfig['rules']