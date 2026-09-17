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
      reportOnFailure: true,
      include: [
        'src/**/*.ts'
      ],
      exclude: [
        'test/**',
        '**/*.css',
        '**/*.types.ts',
        '**/*.factory.ts',
        '**/cli.ts'
      ]
    }
  }
})