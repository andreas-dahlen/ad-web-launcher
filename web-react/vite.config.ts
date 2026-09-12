import path from 'node:path'
import { mergeConfig } from 'vite'
import baseConfig from './vite.base.config.ts'
import { createTokenCompilerPlugin } from './tools/plugins/src/vite.token-compiler.ts'

const projectRoot = path.resolve(import.meta.dirname)

export default mergeConfig(
  baseConfig,
  {
    plugins: [
      createTokenCompilerPlugin(projectRoot)
    ]
  }
)