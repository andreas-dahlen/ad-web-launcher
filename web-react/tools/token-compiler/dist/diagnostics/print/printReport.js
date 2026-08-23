export function printReport(sections) {
    for (const section of sections) {
        console.log(`${section.title}`);
        for (const [index, entry] of section.entries.entries()) {
            console.log(`  ${entry.title}`);
            if (entry.lines) {
                for (const line of entry.lines) {
                    console.log(`     ${line}`);
                }
                if (index < section.entries.length - 1) {
                    console.log();
                }
            }
        }
        console.log("─────────────────────────────────────────────");
    }
}
