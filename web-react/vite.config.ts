import path from 'node:path'
import { mergeConfig } from 'vite'
import baseConfig from './vite.base.config.ts'
import { createCascadePlugin } from './tools/plugins/src/vite.cascade-plugin.ts'

const projectRoot = path.resolve(import.meta.dirname)

export default mergeConfig(
  baseConfig,
  {
    plugins: [
      createCascadePlugin(projectRoot)
    ]
  }
)