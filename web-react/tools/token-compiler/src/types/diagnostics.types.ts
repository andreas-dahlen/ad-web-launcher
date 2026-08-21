import type { CssVarString } from '../oldSharedUtils/oldSharedCompiler.types.js';
import type { Issue } from './issueCollector.types.js';

export type DiagnosticData = {
  missingClasses: MissingClass[];
  unusableSelectors: UnusableSelector[]
  mismatchedVariables: VariableMismatch[]
  invalidVarDeclarations: InvalidVarDeclaration[]
  missingCssModules: string[]
  processedGroupCount: number
  generatedFiles: GeneratedFiles
  issues: AnalyzedIssueGroup[]
  omittedPresetFiles: string[]
}

type IssueContextGroup = {
  context?: string
  issues: Issue[]
}

export type AnalyzedIssueGroup = {
  subject: string
  contexts: IssueContextGroup[]
}

export type UnusableSelector = {
  cssPath: string;
  unusableSelectors: string[];
};

export type MissingClass = {
  infix: string;
  tokenPath: string;
  usableSelectors: string[];
};

export type VariableMismatch = {
  name: string;
  infix: string;
  missing: CssVarString[];
  unused: CssVarString[];
};

export type InvalidVarDeclaration = {
  name: string;
  infix: string;
  invalid: CssVarString[]
};

export type GeneratedFiles = {
  presets: FileStatus
  tokens: FileStatus
}

export type FileStatus = {
  written: string[]
  skipped: string[]
}