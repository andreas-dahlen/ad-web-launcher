import {
  defineConfig
} from 'vitest/config'

// vitest.config.ts
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
      exclude: [
        'src/test/**',
        '**/*.css',
      ],
    },
  },
})
