import type { Linter } from 'eslint'

const config: Linter.Config = {
  files: ['src/**/*.{ts,tsx}'],

  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
}

export default config