import extractGroupName from '../../compiler/resolvers/extractGroupName.ts';
import resolveProcessedGroups from '../../compiler/resolvers/resolveProcessedGroups.ts';
import type { CompilerRun } from '../../compiler/state/compilerRun.ts';
import type { TokenCache } from "../../compiler/state/tokenCache.ts";
import analyzeSelectors, { type UnusableSelector } from "./analyzers/analyzeSelectors.ts";
import analyzeTokens, { type MissingClass } from './analyzers/analyzeTokens.ts';
import analyzeVariableUsage, { type VariableMismatch } from './analyzers/analyzeVariableUsage.ts';
import analyzeWriteResult, { type GeneratedFiles } from './analyzers/analyzeWriteResult.ts'
import analyzeIssues, { type AnalyzedIssueGroup } from './analyzers/analyzeIssues.ts';

export type DiagnosticData = {
  missingClasses: MissingClass[];
  unusableSelectors: UnusableSelector[]
  mismatchedVariables: VariableMismatch[]
  missingCssModules: string[]
  processedGroupCount: number
  generatedFiles: GeneratedFiles
  issues: AnalyzedIssueGroup[]
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

  const emitResult = run.getEmitResult()
  const issues = analyzeIssues(run.getIssues())

  const generatedFiles = analyzeWriteResult(emitResult?.writeResult)


  const groups = resolveProcessedGroups(cache, run)

  const processedGroupCount = groups.length

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
    missingCssModules,
    processedGroupCount,
    generatedFiles,
    issues
  }
}