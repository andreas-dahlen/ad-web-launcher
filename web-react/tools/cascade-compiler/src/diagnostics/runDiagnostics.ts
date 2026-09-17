import type { CompilerRun } from '../compiler/tracking/compilerRun.ts';
import type { TokenCache } from '../compiler/tracking/tokenCache.ts';
import { buildAnalysis } from './analysis/buildAnalysis.ts';
import { buildReport } from './report/buildReport.ts';
import { printReport } from './report/printReport.ts';

export function runDiagnostics(
  cache: TokenCache,
  run: CompilerRun,
) {

  const data = buildAnalysis(cache, run)

  const report = buildReport(data, cache.getConfig())

  printReport(report)

}