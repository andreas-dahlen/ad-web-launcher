export function createCompilerRun(loadedIssues) {
    const processedPaths = new Set();
    let emitResult;
    const processedIssues = [];
    recordIssues(loadedIssues);
    function reset() {
        processedPaths.clear();
        emitResult = undefined;
        processedIssues.length = 0;
    }
    function recordProcessed(cssPath) {
        processedPaths.add(cssPath);
    }
    function recordEmitResult(result) {
        emitResult = result;
    }
    function recordIssues(issues) {
        processedIssues.push(...issues);
    }
    return {
        reset,
        recordProcessed,
        recordEmitResult,
        recordIssues,
        getProcessedPaths() { return [...processedPaths]; },
        getEmitResult() { return emitResult; },
        getIssues() { return [...processedIssues]; }
    };
}
