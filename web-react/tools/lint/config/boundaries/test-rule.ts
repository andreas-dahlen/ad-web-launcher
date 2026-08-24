export type TestRule = [
  'error',
  ...unknown[],
]

export const testRule: {
  'boundaries/dependencies': TestRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',
      policies: [],
    },
  ],
}

const testOverride = {
  files: ['src/**/*.{ts,tsx}'],
  rules: testRule,
}

