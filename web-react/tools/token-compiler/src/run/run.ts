import { initializeCompiler } from '../compiler/compilerService.js'
import { handlePathAuthority } from './pathAuthority.js'
import { watch } from './watcher.js'

export type UserOverrides = {
  tokenFolder?: string
  outDir?: string
}
export type CompilerConfig = {
  rootDir: string
  tokenPath: string
  outPath: string
}


export function run(rootDir: string, overrides: UserOverrides) {

  const config = handlePathAuthority(rootDir, overrides)

  // const rootPath = rootDir ?? paths.getRoot()
  // const tokenPath = config.tokenFolder ?? paths.getTokenRoot()
  // const outPath = config.outDir ?? paths.getOutRoot()

  const compiler = initializeCompiler(config)

  console.log("RUN: starts watcher")

  watch(config, compiler)
}