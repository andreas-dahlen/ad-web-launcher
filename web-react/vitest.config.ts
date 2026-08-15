import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'
export default mergeConfig(
  viteConfig,
  defineConfig({

    test: {
      reporters: ['verbose'],
      coverage: {
        provider: 'v8',
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
              'src/test/node/**',
              'src/test/react/**'
            ],
            setupFiles: [
              'src/test/app/setup.utils.ts',
            ],
          },
        },
        {
          extends: "./vite.base.ts",

          test: {
            name: 'react',
            environment: 'jsdom',

            include: [
              'src/test/react/**/*.test.{ts,tsx}',
            ],

            setupFiles: [
              'src/test/react/setup.utils.ts',
            ],
          },
        },
        {
          extends: true,
          test: {
            name: 'styleTokens',
            environment: 'node',
            include: [
              'src/test/node/**/*.test.ts'
            ],
            setupFiles: [
              'src/test/node/setup.utils.ts',
            ]
          }
        }
      ]
    }
  })
)