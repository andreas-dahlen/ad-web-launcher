import { mergeConfig } from 'vite'
import baseConfig from './vite.base.ts'
import tokenConfig from './vite.compiler.ts'

export default mergeConfig(
  baseConfig,
  tokenConfig
)