import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['verbose'],

    environment: 'node',

    include: [
      'src/test/styleTokens/**/*.ts',
    ],

    setupFiles: [
      'src/test/setup.utils.ts',
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        'src/test/**',
        '**/*.css',
      ],
    },

  },
})