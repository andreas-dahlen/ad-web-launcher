import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      project: [
        'src/**/*.{ts,tsx}',
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
        'custom/**/*-plugin.ts',
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

    'tools/token-compiler': {
      project: [
        'src/**/*.ts',
      ],
      entry: [
        'cli.ts'
      ]
    },

    'tools/extensions/css-variable-completion': {
      project: [
        'src/**/*.ts',
      ],
    },

    'tools/extensions/token-compiler-vscode': {
      project: [
        'src/**/*.ts',
      ],
    },
  },
}

export default config