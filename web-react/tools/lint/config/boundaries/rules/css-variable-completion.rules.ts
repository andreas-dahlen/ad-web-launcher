import type { BoundaryRule } from '../lint.types.ts'
export const cssVariableCompletionRules: {
  'boundaries/dependencies': BoundaryRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',

      policies: [

        {
          from: { element: { type: "lsp" } },
          allow: { to: { element: { type: "config" } } }
        },

        {
          from: { file: { categories: "entry" } },
          allow: {
            to: [
              { element: { type: "lsp" } },
              { element: { type: "config" } },
              { element: { type: "variables" } }
            ]
          }
        },
        {
          from: { element: { type: "variables" } },
          allow: {
            to: [
              { element: { type: "completion" } },
              { element: { type: "config" } }
            ]
          }
        },
        {
          from: { element: { type: "completion" } },
          allow: {
            to: { element: { type: "variables" } },
          }
        }
      ] as const
    }
  ]
}