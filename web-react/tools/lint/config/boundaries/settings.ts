import { boundariesElements } from './elements.ts'
import { boundariesFiles } from './files.ts'

export const boundarySettings = {
  'import/resolver': {
    typescript: {
      project: './tsconfig.json',
      alwaysTryTypes: true,
    },
  },

  'boundaries/elements': boundariesElements,
  'boundaries/files': boundariesFiles,

  'boundaries/debug': {
    enabled: true,
    messages: {
      files: true,
      dependencies: false,
      violations: true,
    },
    filter: {
      files: [
        {
          file: {
            categories: 'boundary',
          },
        },
      ],
    },
  },

  'boundaries/ignore': [
    '**/test/**/*',
    '**/assets/**/*',
    '**/*.boundary.ts',
  ],
}