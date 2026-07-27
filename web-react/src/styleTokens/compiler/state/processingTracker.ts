export function createProcessingTracker(expectedCssPaths: string[]) {
  const expected = new Set(expectedCssPaths);
  const processed = new Set<string>();
  const failures = new Set<string>();

  return {
    snapshot,
    markProcessed,
    markMissing,
    invalidate,
    // hasFailed,
    hasSucceeded,
    hasFinished
  };
  function snapshot() {
    return {
      expected: new Set(expected),
      processed: new Set(processed),
      failures: new Set(failures)
    }
  }

  function markProcessed(cssPath: string) {
    processed.add(cssPath)
    failures.delete(cssPath)
  }

  function markMissing(cssPath: string) {
    if (!expected.has(cssPath)) {
      return;
    }
    failures.add(cssPath)
    processed.delete(cssPath)
  }


  function invalidate(cssPath: string) {
    expected.add(cssPath)
    processed.delete(cssPath)
    failures.delete(cssPath)
  }


  // function hasFailed() {
  //   return hasFinished() && !hasSucceeded()
  // }

  function hasFinished() {
    for (const cssPath of expected) {
      if (!processed.has(cssPath) && !failures.has(cssPath)) {
        return false;
      }
    }

    return true;
  }

  function hasSucceeded() {
    return hasFinished() && failures.size === 0;
  }
}