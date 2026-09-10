import type z from 'zod';
import { compilerConfigSchema, compilerLoggingSchema, compilerOutputsSchema } from '../schema/configSchema.ts';
import type { TokenCompiler } from '../compiler/compilerService.ts';
import type { FSWatcher } from 'chokidar';
export type CompilerOptions = z.infer<typeof compilerConfigSchema>

export type CompilerConfig = {
  rootDir: string
  tokenPath: string
  outPath: string | null
  outputs: CompilerOutputs
  logging: CompilerLogs
}
export type CompilerOutputs = Required<z.infer<typeof compilerOutputsSchema>>

type CompilerLogs = Required<z.infer<typeof compilerLoggingSchema>>

export type CompilerRuntime = {
  compiler: TokenCompiler
  contentWatcher: FSWatcher
  configWatcher: FSWatcher
  dispose(): Promise<void>
}