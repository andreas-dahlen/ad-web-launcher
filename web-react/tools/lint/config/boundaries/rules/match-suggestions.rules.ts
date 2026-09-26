import type { BoundaryRule } from '../lint.types.ts'
export const matchSuggestionsRules: {
  'boundaries/dependencies': BoundaryRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',

      policies: [
        {
          from: { element: { type: "*" } },
          allow: { to: { element: { type: "types" } } }
        },
        {
          from: { file: { categories: "entry" } },
          allow: {
            to: [
              { element: { type: "snippets" } },
              { element: { type: "completion" } }
            ]
          }
        },
        {
          from: [
            { element: { type: "snippets" } },
            { element: { type: "types" } },
            { element: { type: "completion" } }
          ],
          allow: { to: { element: { type: "schemas" } } }
        },
      ] as const
    }
  ]
}