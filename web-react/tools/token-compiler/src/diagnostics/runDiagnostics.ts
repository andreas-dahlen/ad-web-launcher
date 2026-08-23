import type { CompilerRun } from '../compiler/tracking/compilerRun.js';
import type { TokenCache } from '../compiler/tracking/tokenCache.js';
import { buildData } from './data/buildData.js';
import { buildReport } from './report/buildReport.js';
import { printReport } from './print/printReport.js';

export function runDiagnostics(
  cache: TokenCache,
  run: CompilerRun,
) {

  const data = buildData(cache, run)

  const report = buildReport(data)

  printReport(report)

}