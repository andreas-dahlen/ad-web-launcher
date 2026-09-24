import { defineConfig } from 'vitest/config'
import { baseCoverageExclude, compilerCoverageExclude } from '../../vitest.coverage-exclude.ts'

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
        ...baseCoverageExclude,
        ...compilerCoverageExclude
      ]
    }
  }
})