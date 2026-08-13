export function createProcessingTracker(expectedCssPaths: string[]) {
  const expected = new Set(expectedCssPaths);
  const processed = new Set<string>();
  const failures = new Set<string>();

  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  let completion:
    | {
      resolve: () => void;
      reject: (error: unknown) => void;
    }
    | undefined;

  return {
    snapshot,
    markProcessed,
    markMissing,
    invalidate,
    notifyActivity,
    awaitCompletion,
    hasSucceeded,
    hasFinished,
  };

  function invalidate(cssPath: string) {
    expected.add(cssPath);
    processed.delete(cssPath);
    failures.delete(cssPath);

    scheduleFlush();
  }

  function markProcessed(cssPath: string) {
    processed.add(cssPath);
    failures.delete(cssPath);

    scheduleFlush();
  }

  function markMissing(cssPath: string) {
    if (!expected.has(cssPath)) {
      return;
    }

    failures.add(cssPath);
    processed.delete(cssPath);

    scheduleFlush();
  }

  function notifyActivity() {
    scheduleFlush();
  }

  function awaitCompletion(): Promise<void> {
    return new Promise((resolve, reject) => {
      completion = { resolve, reject };
      scheduleFlush();
    });
  }

  function scheduleFlush() {
    if (flushTimer) {
      clearTimeout(flushTimer);
    }

    flushTimer = setTimeout(checkCompletion, 1000);
  }

  function checkCompletion() {
    flushTimer = undefined;

    if (!completion) {
      return;
    }

    if (hasFinished()) {
      const currentCompletion = completion;
      completion = undefined;

      currentCompletion.resolve();
      return;
    }

    const missing = [...expected].filter(
      cssPath =>
        !processed.has(cssPath) &&
        !failures.has(cssPath),
    );

    const error = new Error(
      [
        "❌ Style token compilation stalled",
        "",
        "Unresolved CSS modules:",
        ...missing.map(path => `  • ${path}`),
        "",
        "Possible causes:",
        "  • CSS module is not imported",
        "  • PostCSS did not process the module",
        "  • processing exited early",
        "",
      ].join("\n"),
    );

    const currentCompletion = completion;
    completion = undefined;

    currentCompletion.reject(error);
  }

  function snapshot() {
    return {
      expected: new Set(expected),
      processed: new Set(processed),
      failures: new Set(failures),
    };
  }

  function hasFinished() {
    for (const cssPath of expected) {
      if (
        !processed.has(cssPath) &&
        !failures.has(cssPath)
      ) {
        return false;
      }
    }

    return true;
  }

  function hasSucceeded() {
    return hasFinished() && failures.size === 0;
  }
}