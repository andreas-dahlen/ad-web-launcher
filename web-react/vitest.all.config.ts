import { defineConfig } from 'vitest/config'
import { compilerCoverageExclude, baseCoverageExclude, cascadeVscodeCoverageExclude, lintCoverageExclude } from './vitest.coverage-exclude.ts'
export default defineConfig({
  test: {
    projects: [
      './vitest.app.config.ts',
      './tools/cascade-compiler/vitest.config.ts',
      './tools/lint/vitest.config.ts',
      './tools/extensions/*/vitest.config.ts',
      './packages/*/vitest.config.ts'
    ],

    coverage: {
      provider: 'v8',
      reportOnFailure: true,

      include: [
        'src/**/*.ts',
        'src/**/*.tsx',

        'tools/cascade-compiler/src/**/*.ts',
        'tools/lint/config/**/*.ts',
        'tools/lint/oxlint-plugins/**/*.ts',
        'tools/extensions/*/src/**/*.ts',
        'packages/*/src/**/*.ts'
      ],

      exclude: [
        ...baseCoverageExclude,
        ...compilerCoverageExclude,
        ...cascadeVscodeCoverageExclude,
        ...lintCoverageExclude
      ]
    }
  }
})
