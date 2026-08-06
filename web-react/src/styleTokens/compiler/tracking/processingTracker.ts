export function createProcessingTracker(expectedCssPaths: string[]) {
  const expected = new Set(expectedCssPaths);
  const processed = new Set<string>();
  const failures = new Set<string>();

  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    snapshot,
    markProcessed,
    markMissing,
    invalidate,
    hasSucceeded,
    hasFinished
  };

  function invalidate(cssPath: string) {
    expected.add(cssPath)
    processed.delete(cssPath)
    failures.delete(cssPath)
    scheduleFlush()
  }

  function markProcessed(cssPath: string) {
    processed.add(cssPath)
    failures.delete(cssPath)
    scheduleFlush()
  }

  function markMissing(cssPath: string) {
    if (!expected.has(cssPath)) {
      return;
    }
    failures.add(cssPath)
    processed.delete(cssPath)
    scheduleFlush()
  }

  function scheduleFlush() {
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    flushTimer = setTimeout(checkStall, 1000);
  }

  function checkStall() {
    flushTimer = undefined;

    if (hasFinished()) return;

    const missing = [...expected].filter(
      cssPath =>
        !processed.has(cssPath) &&
        !failures.has(cssPath)
    );

    throw new Error(
      [
        "❌ Style token compilation stalled",
        "",
        "Unresolved CSS modules:",
        ...missing.map(path => `  • ${path}`),
        "",
        "Possible causes:",
        "  • CSS module is not imported",
        "  • PostCSS did not process the module",
        "  • processing exited early \n \n"
      ].join("\n")
    );
  }

  function snapshot() {
    return {
      expected: new Set(expected),
      processed: new Set(processed),
      failures: new Set(failures),
    }
  }

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