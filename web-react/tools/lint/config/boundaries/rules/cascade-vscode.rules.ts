import type { BoundaryRule } from '../lint.types.ts'
export const cascadeVscodeRules: {
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
              { element: { type: 'config' } },
              { element: { type: 'terminal' } },
              { element: { type: 'vscode' } }
            ]
          }
        }
      ] as const
    }
  ]
}