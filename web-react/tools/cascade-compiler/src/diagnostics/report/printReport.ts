import type { ReportSection } from './buildReport.ts';

export function printReport(sections: ReportSection[]) {
  for (const section of sections) {
    console.log(`${section.title}`);
    const line = "─────────────────────────────────────────────"

    for (const [index, entry] of section.entries.entries()) {
      console.log(`  ${entry.title}`);

      if (!entry.lines) {
        continue
      }

      for (const line of entry.lines) {
        console.log(`     ${line}`);
      }
      if (index < section.entries.length - 1) {

        console.log()
      }
    }
    console.log(line);
  }
}
