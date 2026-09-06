import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'
export default mergeConfig(
  viteConfig,
  defineConfig({

    test: {
      reporters: ['verbose'],
      coverage: {
        provider: 'v8',
        include: [
          'src/**/*.ts',
          'src/**/*.tsx'
        ],
        exclude: [
          'src/test/**',
          '**/*.css'
        ]
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'app',
            environment: 'jsdom',
            include: [
              'src/**/*.test.ts',
            ],
            exclude: [
              'src/test/react/**'
            ],
            setupFiles: [
              'src/test/app/setup.utils.ts',
            ],
          },
        },
        {
          extends: true,

          test: {
            name: 'react',
            environment: 'jsdom',

            include: [
              'src/test/react/**/*.test.{ts,tsx}',
            ],

            setupFiles: [
              'src/test/react/setup.utils.ts',
            ]
          }
        },
        './tools/token-compiler/vitest.config.ts',
        './tools/lint/vitest.config.ts',
        './tools/plugins/vitest.config.ts',
        './tools/extensions/*/vitest.config.ts'
      ]
    }
  })
)