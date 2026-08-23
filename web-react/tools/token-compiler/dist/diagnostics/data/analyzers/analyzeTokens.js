export function analyzeTokens(cssData) {
    const missingClasses = [];
    for (const token of cssData.tokens) {
        if (!token.processed) {
            missingClasses.push({
                infix: token.infix,
                tokenPath: token.tokenPath,
                usableSelectors: cssData.usableSelectors
            });
        }
    }
    return missingClasses;
}
