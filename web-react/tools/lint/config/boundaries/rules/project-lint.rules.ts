import type { BoundaryRule } from '../lint.types.ts'
export const projectLintRules: {
  'boundaries/dependencies': BoundaryRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',

      policies: [
        {
          from: { file: { categories: 'entry' } },
          allow: {
            to: [
              { element: { type: 'vscode' } },
              { element: { type: 'helpers' } },
              { element: { type: 'oxlint' } }
            ]
          }
        }
      ] as const
    }
  ]
}