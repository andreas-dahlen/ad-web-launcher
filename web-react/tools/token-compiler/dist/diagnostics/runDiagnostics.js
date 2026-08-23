import { buildData } from './data/buildData.js';
import { buildReport } from './report/buildReport.js';
import { printReport } from './print/printReport.js';
export function runDiagnostics(cache, run) {
    const data = buildData(cache, run);
    const report = buildReport(data);
    printReport(report);
}
