export function createProcessingTracker(expectedPaths: string[]) {
  const expected = new Set(expectedPaths);
  const processed = new Set<string>();

  return {
    markProcessed,
    isComplete,
    resync,
    snapshot
  };

  function markProcessed(path: string) {
    processed.add(path);
  }

  function isComplete() {
    for (const path of expected) {
      if (!processed.has(path)) {
        return false;
      }
    }

    return true;
  }

  function resync(paths: string[]) {
    expected.clear();

    for (const path of paths) {
      expected.add(path);
    }

    processed.clear();
  }

  function snapshot() {
    return {
      expected: new Set(expected),
      processed: new Set(processed),
    };
  }
}