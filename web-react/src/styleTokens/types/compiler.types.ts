import type { ValidPrefix } from '../../shared/tokenUtils/compiler.types';

export interface TokenGroup {
  groupPath: string;
  cssPath?: string;
  tokens: LoadedToken[];
}

export type LoadedVariable = {
  key: string;
  name: string;
  allowed: ValidPrefix[];
  exclude: ValidPrefix[];
  values: Partial<Record<ValidPrefix, string>>;
  effectiveAllowed: ValidPrefix[]
};

export type LoadedToken = {
  name: string;
  tokenPath: string;
  infix: string;
  alwaysAllowed: ValidPrefix[];
  vars: LoadedVariable[];
};