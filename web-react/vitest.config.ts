import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'
export default mergeConfig(
  viteConfig,
  defineConfig({

    test: {
      reporters: ['verbose'],
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
            ],
            setupFiles: [
              'src/test/setup.utils.ts',
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
              'src/test/node/styleTokens/setup.utils.ts',
            ]
          }
        }
      ]
    }
  })
)