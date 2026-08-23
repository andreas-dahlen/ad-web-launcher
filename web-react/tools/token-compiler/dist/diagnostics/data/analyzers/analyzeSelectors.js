export function analyzeSelectors(cssData) {
    const unusableSelectors = cssData.foundSelectors.filter(selector => !cssData.usableSelectors.includes(selector));
    if (unusableSelectors.length === 0) {
        return;
    }
    return {
        cssPath: cssData.cssPath,
        unusableSelectors,
    };
}
