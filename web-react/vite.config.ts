import { mergeConfig } from 'vite'
import baseConfig from './vite.base.config.ts'
import { createCascadePlugin } from 'cascade/vite'

export default mergeConfig(
  baseConfig,
  {
    plugins: [
      createCascadePlugin(process.cwd())
    ]
  }
)