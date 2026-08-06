import type { Rule } from 'postcss';
import type { CssVarString, ValidPrefix } from '../../shared/tokenUtils/compiler.types.ts';

import type { IssueGroup } from './issueCollector.types.ts';

//postcss
export type PresetResetData = Map<Rule, Set<CssVarString>>
export type WalkModuleResult = {
  rules: Map<string, Rule>
  foundSelectors: string[]
  usableSelectors: string[]
  foundFinalVariables: CssVarString[]
  declaredVariables: CssVarString[]
  presetResetData: PresetResetData
};

//raw tokens
export type RawToken = {
  component: string;
  infix?: string;
  alwaysAllowed?: ValidPrefix[];
  vars: Record<string, RawVariable>;
};

export type RawVariable = {
  name?: string;
  allowed?: ValidPrefix[];
  exclude?: ValidPrefix[];
  values?: Partial<Record<ValidPrefix, string>>;
}


//resolved Token
export type CompilerToken = {
  name: string;
  tokenPath: string;
  infix: string;
  vars: CompilerVariable[];
};
export type CompilerVariable = {
  key: string;
  name: string;
  values: Partial<Record<ValidPrefix, string>>;
  effectiveAllowed: ValidPrefix[]
};
export type TokenResult = {
  token: CompilerToken;
  issues: IssueGroup[]
}
export interface TokenGroup {
  groupPath: string;
  cssPath?: string;
  tokens: CompilerToken[];
}
export type TokenGroupResult = {
  group: TokenGroup;
  issues: IssueGroup[];
}
export type TokenGroupsResult = {
  groups: TokenGroup[];
  issues: IssueGroup[];
}

//CSS path is garanteed.
export type CssTokenGroup = TokenGroup & {
  cssPath: string
}

// after CSS processing
export type CssData = { // CssModuleResult
  groupPath: string
  cssPath: string
  foundSelectors: string[]
  usableSelectors: string[]
  tokens: ProcessedToken[]
  foundFinalVariables: CssVarString[]
  declaredVariables: CssVarString[]
}
export type ProcessedToken = {
  name: string
  infix: string
  tokenPath: string
  processed: boolean
}

export type EmitResult = {
  writeResult: FileResult
  patchResult: FileResult
}
export type FileResult = {
  updated: string[]
  skipped: string[]
}

// export type WriteResult = {
//   written: string[]
//   skipped: string[]
// }
// export type PatchResult = {
//   written: string[]
//   skipped: string[]
// }
