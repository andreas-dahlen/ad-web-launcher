import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      project: [
        'src/**/*.{ts,tsx}',
        '*.config.ts',
      ],
      entry: [
        'vitest.all.config.ts',
      ],
    },

    'packages/dasx': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'src/index.ts'
      ]
    },

    'tools/lint': {
      project: [
        '**/*.ts',
      ],
      entry: [
        'oxlint-plugins/**/*-plugin.ts',
      ],
    },

    'tools/cascade-compiler': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'src/**/cli.ts',
        'src/public/index.ts',
        "src/public/vite.ts"
      ]
    },

    'tools/extensions/css-variable-completion': {
      project: [
        'src/**/*.ts',
      ],
    },
    'tools/extensions/match-suggestions': {
      project: [
        'src/**/*.ts',
      ],
    },

    'tools/extensions/cascade-vscode': {
      project: [
        'src/**/*.ts',
      ],
    },
    'tools/extensions/project-lint': {
      project: [
        'src/**/*.ts',
      ],
    },
  },
}

export default config