import { defineConfig, mergeConfig } from 'vitest/config'
import viteBaseConfig from './vite.base.config.ts'
export default mergeConfig(
  viteBaseConfig,
  defineConfig({
    test: {
      reporters: ['verbose'],
      projects: [
        {
          test: {
            name: 'app',
            environment: 'jsdom',
            include: ['src/**/*.test.ts'],
            exclude: ['src/test/react/**'],
            setupFiles: ['src/test/app/setup.utils.ts'],
          },
        },

        {
          test: {
            name: 'react',
            environment: 'jsdom',
            include: ['src/test/react/**/*.test.{ts,tsx}'],
            setupFiles: ['src/test/react/setup.utils.ts'],
          },
        },
      ],
    },
  })
)