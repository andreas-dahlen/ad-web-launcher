import type { CssVarString, ValidPrefix } from '../oldSharedUtils/oldSharedCompiler.types.ts'
import type { CompilerConfig, CompilerOutputs } from './run.types.ts'

export type EmitConfig = CompilerConfig & {
  outPath: string
}
export type CompilerFileOutput =
  Exclude<keyof CompilerOutputs, 'pathPatches'>

export type CompilerPatchOutput = "jsonc" | "css"

// extractData types
export type TokenGroupData = {
  groupPath: string
  name: string
  styleName: string
  typeName: string
  outputFile: string
  tokens: TokenData[]
}
export type TokenData = {
  infix: string
  variables: VarData[];
}
type VarData = {
  cssName: string
  key: string
  allowed: ValidPrefix[]
  values: Partial<Record<ValidPrefix, string>>
}


export type PresetFileData = {
  typeName: string
  selectors: string[];
  outputFile: string
};

export type GroupMetadata = {
  name: string
  groupPath: string
  tokenFiles: string[]
  cssFile: string
  outputFile: string
}

export type LspData = {
  rgbVariables: string[]
  tokens: TokenData[]
  outputFile: string
}

export type ExtensionData = {
  variables: CssVarString[]
  outputFile: string
}

export type PackageData = {
  fileNames: string[]
  outputFile: string
}

export type EmitData = {
  presetFiles: PresetFileData[]
  tokenFiles: TokenGroupData[]
  jsonSchema: FormatFileResult
  metadata: GroupMetadata[]
  extensionData: ExtensionData
  lspData: LspData
  packageData: PackageData
}
export type GeneratedOutput = {
  files: FormatFileResult[]
  patches: FormatPatchResult[]
}

type FormatResult = {
  outputFile: string;
  content: string;
};
export type FormatFileResult = FormatResult & {
  kind: CompilerFileOutput
}
export type FormatPatchResult = FormatResult & {
  kind: CompilerPatchOutput
}

//for diagnostics results
export type EmitResult = {
  extractResult: ExtractResult
  writeResult: FileResult
  patchResult: PatchResult
}
export type ExtractResult = {
  omittedPresetFiles: string[]
}

export type EmittedFile = Omit<FormatFileResult, "content">
export type EmittedPatch = Omit<FormatPatchResult, "content">
export type FileResult = {
  written: EmittedFile[]
  skipped: EmittedFile[]
}

export type PatchResult = {
  written: EmittedPatch[]
  skipped: EmittedPatch[]
}

// export type FileGroup = {
//   kind: CompilerFileOutput
//   files: string[]
// }

// export type PatchGroup = {
//   kind: CompilerPatchOutput
//   files: string[]
// }