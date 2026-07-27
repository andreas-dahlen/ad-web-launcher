import extractGroupName from '../../../shared/tokenUtils/extractGroupName.ts';
import resolveProcessedGroups from '../../compiler/resolvers/resolveProcessedGroups.ts';
import type { CompilerRun } from '../../compiler/state/compilerRun.ts';
import type { TokenCache } from "../../compiler/state/tokenCache.ts";
import analyzeSelectors, { type UnusableSelector } from "./analyzers/analyzeSelectors.ts";
import analyzeTokens, { type MissingClass } from './analyzers/analyzeTokens.ts';
import analyzeVariableUsage, { type VariableMismatch } from './analyzers/analyzeVariableUsage.ts';

export type DiagnosticData = {
  missingClasses: MissingClass[];
  unusableSelectors: UnusableSelector[]
  mismatchedVariables: VariableMismatch[]
  missingCssModules: string[]
}

export default function buildData(
  cache: TokenCache,
  run: CompilerRun,
  //tracker!?
): DiagnosticData {

  const missingClasses: MissingClass[] = []
  const unusableSelectors: UnusableSelector[] = []
  const mismatchedVariables: VariableMismatch[] = []

  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/

  const missingCssModules = run.getMissingModules()
    .map(groupPath => extractGroupName(groupPath))


  const groups = resolveProcessedGroups(cache, run)
  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    //nothing yet xD

    const cssData = run.getCssData(group.groupPath)
    if (!cssData) {
      //this should NOT throw... 
      continue;
    }

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/

    const selectorResult = analyzeSelectors(cssData);
    if (selectorResult) unusableSelectors.push(selectorResult)

    missingClasses.push(...analyzeTokens(cssData))
    mismatchedVariables.push(...analyzeVariableUsage(cssData, group))
  }

  return {
    missingClasses,
    unusableSelectors,
    mismatchedVariables,
    missingCssModules
  }
}