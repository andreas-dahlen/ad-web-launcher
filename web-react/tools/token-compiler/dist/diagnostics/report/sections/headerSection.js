import { colors, paint } from '../../../utils/string.js';
export function headerSection(processedGroupCount) {
    const entries = [];
    if (processedGroupCount > 1) {
        entries.push({
            title: `\n  ✨ ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Initialization complete!`, colors.value)}\n`,
            lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
        });
    }
    else {
        entries.push({
            title: `\n  🔄 ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Update complete!`, colors.value)}\n`,
            lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
        });
    }
    return {
        title: "─────────────────────────────────────────────",
        entries
    };
}
