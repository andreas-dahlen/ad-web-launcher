import { colors, formatLogPath, paint } from '../../../utils/string.js';
export function selectorSection(data) {
    const entries = [];
    for (const unusables of data) {
        const lines = [];
        if (unusables.unusableSelectors.length > 0) {
            lines.push(`  ${paint(`Selectors`, colors.subHeading)} (${paint(unusables.unusableSelectors.length, colors.value)})
       ${colors.symbol}${unusables.unusableSelectors.join(`${colors.reset}, ${colors.symbol}`)}${colors.reset}`);
            entries.push({
                title: ` 📄 ${paint(`File:`, colors.muted)} ${paint(formatLogPath(unusables.cssPath), colors.file)}`,
                lines
            });
        }
    }
    if (entries.length === 0)
        return;
    return {
        title: `${paint(`🙊 [Unusable Preset Selectors]`, colors.heading)} (${paint(entries.length, colors.value)}) \n`,
        entries
    };
}
