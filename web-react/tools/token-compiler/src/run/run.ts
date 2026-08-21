import { initializeCompiler } from '../compiler/compilerService.js'
import { paths } from './paths.js'
import { watch } from './watcher.js'

export type UserConfig = {
  rootDir?: string
  tokenFolder?: string
  outDir?: string
}
export type CompilerConfig = {
  rootPath: string
  tokenPath: string
  outPath: string
}


export function run(config: UserConfig) {

  const rootPath = config.rootDir ?? paths.getRoot()
  const tokenPath = config.tokenFolder ?? paths.getTokenRoot()
  const outPath = config.outDir ?? paths.getOutRoot()

  const compiler = initializeCompiler({ rootPath, tokenPath, outPath })

  console.log("RUN: starts watcher")

  watch(rootPath, tokenPath, compiler)
}