import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      project: [
        'src/**/*.{ts,tsx}',
        '*.config.ts',
      ],
      entry: [
        'vitest.coverage.config.ts',
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

    'packages/cascade': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'src/index.ts',
        'src/generated/metadata/lsp.ts'
      ]
    },

    'tools/lint': {
      project: [
        '**/*.ts',
      ],
      entry: [
        'src/**/*-plugin.ts',
      ],
    },

    'tools/plugins': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'src/**/vite.*.ts'
      ]
    },

    'tools/cascade-compiler': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'src/**/cli.ts'
      ]
    },

    'tools/extensions/css-variable-completion': {
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