import { defineConfig, mergeConfig } from 'vitest/config';
import vitestConfig from './vitest.config.ts'


export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reportOnFailure: true,

        include: [
          'src/**/*.ts',
          'src/**/*.tsx',

          'tools/token-compiler/src/**/*.ts',
          'tools/lint/src/**/*.ts',
          'tools/plugins/src/**/*.ts',
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
)