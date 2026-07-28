import type { WriteResult } from '../emitters/write/writeFiles.ts';
import type { CssVarString, ValidPrefix } from '../../shared/tokenUtils/compiler.types';

export interface TokenGroup {
  groupPath: string;
  cssPath?: string;
  tokens: LoadedToken[];
}

export type CssTokenGroup = TokenGroup & {
  cssPath: string
}

export type CssData = { // CssModuleResult
  groupPath: string
  cssPath: string
  foundSelectors: string[]
  usableSelectors: string[]
  tokens: TokenResult[]
  foundVariables: CssVarString[]
}

export type TokenResult = { //TODO rename to ProcessedToken actually KEEP TOKENRESULT!!
  name: string
  infix: string
  tokenPath: string
  processed: boolean
}


export type LoadedVariable = { //rename to variable? or TokenVariable.
  key: string;
  name: string;
  allowed: ValidPrefix[];
  exclude: ValidPrefix[];
  values: Partial<Record<ValidPrefix, string>>;
  effectiveAllowed: ValidPrefix[]
};

export type LoadedToken = { //rename to token
  name: string;
  tokenPath: string;
  infix: string;
  alwaysAllowed: ValidPrefix[];
  vars: LoadedVariable[];
};

export type EmitResult = {
  writeResult: WriteResult
}