import { defineConfig } from 'vitest/config'
import { baseCoverageExclude } from '../../../vitest.coverage-exclude.ts'

export default defineConfig({
  test: {
    reporters: ['verbose'],

    environment: 'node',

    include: [
      'src/test/**/*.test.ts',
    ],

    setupFiles: [
      './src/test/setup.utils.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.ts'
      ],
      exclude: [
        ...baseCoverageExclude
      ]
    }
  }
})