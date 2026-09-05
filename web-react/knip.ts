import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      project: [
        'src/**/*.{ts,tsx}',
      ],
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
        '**/*.ts',
      ],
    },

    'tools/token-compiler': {
      project: [
        'src/**/*.ts',
      ],
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