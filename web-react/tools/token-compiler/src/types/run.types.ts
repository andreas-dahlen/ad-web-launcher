import type z from 'zod';
import { compilerConfigSchema } from '../configSchema.js';

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