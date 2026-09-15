import type z from 'zod';
import { compilerConfigSchema, compilerLoggingSchema, compilerOutputsSchema } from '../schema/configSchema.ts';
import type { TokenCompiler } from '../compiler/compilerService.ts';
import type { FSWatcher } from 'chokidar';
export type CompilerOptions = z.infer<typeof compilerConfigSchema>

export type CompilerConfig = {
  projectRoot: string
  tokenPath: string
  outPath: string | null
  generatedPath: string | null
  outputs: CompilerOutputs
  logging: CompilerLogs
  internal: InternalConfig
}

type InternalConfig = {
  willEmitCss: boolean
  initialProcessing: boolean
}
export type CompilerOutputs = Required<z.infer<typeof compilerOutputsSchema>>

type CompilerLogs = Required<z.infer<typeof compilerLoggingSchema>>

export type CompilerRuntime = {
  compiler: TokenCompiler
  contentWatcher: FSWatcher
  configWatcher: FSWatcher
  dispose(): Promise<void>
}

export type CompilerInternalConfig = {
  outPath?: string | null
  emissions?: CompilerLogs["emissions"]
  trace?: CompilerLogs["trace"]
  willEmitCss?: boolean
  initialProcessing?: boolean
  generatedPath?: string | null
  outputs?: Partial<CompilerOutputs>
}

export type CssReturn = {
  compiler: TokenCompiler
  tokenFolder: string | undefined
}