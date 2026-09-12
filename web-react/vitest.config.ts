import { defineConfig, mergeConfig } from 'vitest/config'
import viteBaseConfig from './vite.base.config.ts'

export default mergeConfig(
  viteBaseConfig,
  defineConfig({
    test: {
      projects: [
        './vitest.app.config.ts',
        './vitest.react.config.ts',
        './tools/token-compiler/vitest.config.ts',
        './tools/lint/vitest.config.ts',
        './tools/plugins/vitest.config.ts',
        './tools/extensions/*/vitest.config.ts',
        './packages/*/vitest.config.ts'
      ]
    }
  })
)