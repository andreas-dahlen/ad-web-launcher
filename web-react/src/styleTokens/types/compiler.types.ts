import type { WriteResult } from '../emitters/write/writeFiles.ts';
import type { CssVarString, ValidPrefix } from '../../shared/tokenUtils/compiler.types';

import type { IssueGroup } from '../../shared/tokenUtils/issueCollector.ts';



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
  foundVariables: CssVarString[]
}
export type ProcessedToken = {
  name: string
  infix: string
  tokenPath: string
  processed: boolean
}

export type EmitResult = {
  writeResult: WriteResult
}


