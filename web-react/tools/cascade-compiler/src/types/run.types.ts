import type z from 'zod';
import { compilerConfigSchema, compilerLoggingSchema, compilerOutputsSchema, compilerPresetIgnoreSchema } from '../schema/configSchema.ts';
import type { TokenCompiler } from '../compiler/compilerService.ts';
import type { FSWatcher } from 'chokidar';
import type { IssueGroup } from './issueCollector.types.ts';
export type CompilerOptionsRaw = z.infer<typeof compilerConfigSchema>

export type CompilerOptionsAndIssues = {
  config: CompilerOptionsRaw
  issues: IssueGroup[]
}

export type CompilerConfig = {
  projectRoot: string
  tokenPath: string
  outputs: CompilerOutputs
  logging: CompilerLogs
  presetIgnore: string[]
  internal: InternalConfig
}

export type CompilerConfigAndIssues = {
  config: CompilerConfig
  issues: IssueGroup[]
}

export type InternalConfig = {
  generatedPath: string
  willEmitCss: boolean
  initialProcessing: boolean
}
export type CompilerOutputs = Required<z.infer<typeof compilerOutputsSchema>>

export type CompilerLogs = Required<z.infer<typeof compilerLoggingSchema>>

export type PresetIgnore = Required<z.infer<typeof compilerPresetIgnoreSchema>>
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