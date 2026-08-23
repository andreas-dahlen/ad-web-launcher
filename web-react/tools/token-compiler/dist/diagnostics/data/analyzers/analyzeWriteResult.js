export function analyzeWriteResult(result) {
    const generatedFiles = {
        presets: {
            written: [],
            skipped: []
        },
        tokens: {
            written: [],
            skipped: []
        }
    };
    const writtenPaths = result?.updated ?? [];
    const skippedPaths = result?.skipped ?? [];
    // const writtenFiles = writtenPaths.map(formatLogPath)
    // const skippedFiles = skippedPaths.map(formatLogPath)
    for (const file of writtenPaths) {
        if (file.endsWith(".preset.ts")) {
            generatedFiles.presets.written.push(file);
        }
        if (file.endsWith(".token.ts")) {
            generatedFiles.tokens.written.push(file);
        }
    }
    for (const file of skippedPaths) {
        if (file.endsWith(".preset.ts")) {
            generatedFiles.presets.skipped.push(file);
        }
        if (file.endsWith(".token.ts")) {
            generatedFiles.tokens.skipped.push(file);
        }
    }
    sortFiles(generatedFiles.presets.written);
    sortFiles(generatedFiles.presets.skipped);
    sortFiles(generatedFiles.tokens.written);
    sortFiles(generatedFiles.tokens.skipped);
    return generatedFiles;
}
function sortFiles(files) {
    files.sort((a, b) => a.localeCompare(b));
}
