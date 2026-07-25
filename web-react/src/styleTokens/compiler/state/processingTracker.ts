export function createProcessingTracker(expectedPaths: string[]) {
  const expected = new Set(expectedPaths);
  const processed = new Set<string>();

  return {
    markProcessed,
    isComplete,
    invalidate,
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

  function invalidate(path: string) {
    if (!expected.has(path)) {
      expected.add(path)
    }

    expected.delete(path);
  }

  function snapshot() {
    return {
      expected: new Set(expected),
      processed: new Set(processed),
    };
  }
}