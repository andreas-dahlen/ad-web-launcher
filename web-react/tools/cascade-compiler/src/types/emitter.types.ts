import type { CssVarString, ValidPrefix } from './cascade.types.ts'
import type { CompilerConfig, CompilerOutputs } from './run.types.ts'

export type EmitConfig = CompilerConfig & {
  generatedPath: string
}
type CompilerFileOutput =
  Exclude<keyof CompilerOutputs, 'pathPatches'>

type CompilerPatchOutput = "jsonc" | "css"

// extractData types
export type TokenGroupData = {
  groupPath: string
  name: string
  styleName: string
  typeName: string
  tokens: TokenData[]
}
export type TokenData = {
  infix: string
  variables: VarData[];
}
export type VarData = {
  cssName: string
  key: string
  allowed: ValidPrefix[]
  values: Partial<Record<ValidPrefix, string>>
}


export type PresetFileData = {
  name: string
  typeName: string
  selectors: string[];
};

export type GroupMetadata = {
  name: string
  groupPath: string
  tokenFiles: string[]
  cssFile: string
}

export type LspData = {
  rgbVariables: string[]
  tokens: TokenData[]
}

export type ExtensionData = {
  variables: CssVarString[]
}

export type PackageData = {
  presetNames: string[]
  tokenNames: string[]
}

export type EmitData = {
  presetFiles: PresetFileData[]
  tokenFiles: TokenGroupData[]
  jsonSchema: string
  metadata: GroupMetadata[]
  extensionData: ExtensionData
  lspData: LspData
  packageData: PackageData
}
export type GeneratedOutput = {
  files: FormatFileResult[]
  patches: FormatPatchResult[]
}

export type FormatResult = {
  content: string;
};
export type FormatFileResult = FormatResult & {
  kind: CompilerFileOutput
  outputFile: string
}
export type FormatPatchResult = FormatResult & {
  kind: CompilerPatchOutput
  outputFile: string
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