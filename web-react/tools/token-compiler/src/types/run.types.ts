import type z from 'zod';
import { compilerConfigSchema } from '../configSchema.ts';
import type { TokenCompiler } from '../compiler/compilerService.ts';
import type { FSWatcher } from 'chokidar';

export type CompilerOptions = z.infer<typeof compilerConfigSchema>

export type UserOptions = {
  tokenFolder?: string
  outDir?: string
  mute?: boolean
}
export type CompilerConfig = {
  rootDir: string
  tokenPath: string
  outPath: string | null
  mute: boolean
}

export type EmitConfig = CompilerConfig & {
  outPath: string
}

export type CompilerRuntime = {
  compiler: TokenCompiler
  contentWatcher: FSWatcher
  configWatcher: FSWatcher
  dispose(): Promise<void>
}