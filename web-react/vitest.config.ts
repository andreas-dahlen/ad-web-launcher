import {
  defineConfig
} from 'vitest/config'
import { baseCoverageExclude } from './vitest.coverage-exclude.ts'

export default defineConfig({
  test: {
    projects: [
      './vitest.app.config.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
      ],
      exclude: baseCoverageExclude
    },
  },
})
