import type { CompilerRun } from '../compiler/tracking/compilerRun.ts';
import type { TokenCache } from '../compiler/tracking/tokenCache.ts';
import { buildData } from './data/buildData.ts';
import { buildReport } from './report/buildReport.ts';
import { printReport } from './print/printReport.ts';

export function runDiagnostics(
  cache: TokenCache,
  run: CompilerRun,
) {

  const data = buildData(cache, run)

  const report = buildReport(data)

  printReport(report)

}