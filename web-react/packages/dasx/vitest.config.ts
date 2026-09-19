import { defineConfig } from 'vitest/config'
import { baseCoverageExclude, cascadeVscodeCoverageExclude } from '../../vitest.coverage-exclude.ts'

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
        ...baseCoverageExclude,
        ...cascadeVscodeCoverageExclude
      ]
    }
  }
})