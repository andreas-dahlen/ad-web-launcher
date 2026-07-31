import type { CompilerRun } from '../compiler/state/compilerRun';
import type { TokenCache } from '../compiler/state/tokenCache';
import buildData from './data/buildData';
import buildReport from './report/buildReport';
import printReport from './print/printReport';

export default function runDiagnostics(
  cache: TokenCache,
  run: CompilerRun,
) {

  const data = buildData(cache, run)

  const report = buildReport(data)

  printReport(report)

}