import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['verbose'],

    environment: 'node',

    include: [
      'test/**/*.test.ts',
    ],

    setupFiles: [
      'test/setup.utils.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.ts'
      ],
      exclude: [
        'test/**',
        '**/*.types.ts'
      ],
    },
  },
})