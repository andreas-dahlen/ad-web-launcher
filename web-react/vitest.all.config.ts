import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    projects: [
      './vitest.app.config.ts',
      './tools/cascade-compiler/vitest.config.ts',
      './tools/lint/vitest.config.ts',
      './tools/extensions/*/vitest.config.ts',
      './packages/*/vitest.config.ts',
    ],

    coverage: {
      provider: 'v8',
      reportOnFailure: true,

      include: [
        'src/**/*.ts',
        'src/**/*.tsx',

        'tools/cascade-compiler/src/**/*.ts',
        'tools/lint/src/**/*.ts',
        'tools/extensions/*/src/**/*.ts',
        'packages/*/src/**/*.ts',
      ],

      exclude: [
        '**/test/**',
        '**/*.css'
      ],
    },
  }
})
