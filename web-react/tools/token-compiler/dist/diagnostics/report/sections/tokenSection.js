import { colors, paint, formatLogPath } from '../../../utils/string.js';
export function tokenSection(data) {
    const entries = [];
    const skippedLines = [];
    if (data.skipped.length > 0) {
        for (const skipped of data.skipped) {
            skippedLines.push(`${paint('File', colors.muted)}: ${paint(formatLogPath(skipped), colors.file)}`);
        }
        entries.push({
            title: ` 😴 ${paint(`skipped:`, colors.subHeading)}`,
            lines: skippedLines
        });
    }
    const writtenLines = [];
    if (data.written.length > 0) {
        for (const written of data.written) {
            writtenLines.push(`${paint('File', colors.muted)}: ${paint(formatLogPath(written), colors.file)}`);
        }
        entries.push({
            title: ` ✅ ${paint(`written:`, colors.success)}`,
            lines: writtenLines
        });
    }
    if (entries.length === 0)
        return;
    // title: `🎯 [Tokens] (${entries.length}) \n`,
    return {
        title: ` 🎯 ${paint(`[Tokens]`, colors.heading)} (${paint(data.skipped.length + data.written.length, colors.value)}) \n`,
        entries
    };
}
