import type { OxlintConfig } from 'oxlint'
export const typeAwareRules = {
  'typescript/no-floating-promises': [
    'error',
    {
      ignoreVoid: true,
      checkThenables: true
    },
  ],
  'typescript/no-misused-promises': 'error',
} satisfies OxlintConfig['rules']