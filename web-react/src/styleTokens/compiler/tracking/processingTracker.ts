const POST_CSS_FLUSH_DELAY_MS = 1000

export function createProcessingTracker(expectedCssPaths: string[]) {
  const expectedPaths = new Set(expectedCssPaths)
  const processedPaths = new Set<string>()
  const failedPaths = new Set<string>()

  let postCssTimer: ReturnType<typeof setTimeout> | undefined

  let completion:
    | {
      resolve: () => void
      reject: (error: unknown) => void
    }
    | undefined

  const __TEST_ONLY_API = () => ({
    expectedPaths: new Set(expectedPaths),
    processedPaths: new Set(processedPaths),
    failedPaths: new Set(failedPaths),
  })

  return {
    __TEST_ONLY_API,
    markProcessed,
    markMissing,
    invalidate,
    notifyPostCssActivity,
    awaitPostCssCompletion,
    tokensSucceeded,
  }

  function invalidate(cssPath: string) {
    expectedPaths.add(cssPath)
    processedPaths.delete(cssPath)
    failedPaths.delete(cssPath)

    schedulePostCssFlush()
  }

  function markProcessed(cssPath: string) {
    processedPaths.add(cssPath)
    failedPaths.delete(cssPath)

    schedulePostCssFlush()
  }

  function markMissing(cssPath: string) {
    if (!expectedPaths.has(cssPath)) {
      return
    }

    failedPaths.add(cssPath)
    processedPaths.delete(cssPath)

    schedulePostCssFlush()
  }

  function notifyPostCssActivity() {
    schedulePostCssFlush()
  }

  function awaitPostCssCompletion(): Promise<void> {
    return new Promise((resolve, reject) => {
      completion = { resolve, reject }
      schedulePostCssFlush()
    })
  }

  function schedulePostCssFlush() {
    if (postCssTimer) {
      clearTimeout(postCssTimer)
    }

    postCssTimer = setTimeout(flushPostCss, POST_CSS_FLUSH_DELAY_MS)
  }

  function flushPostCss() {
    postCssTimer = undefined

    if (!completion) {
      return
    }

    if (allPathsResolved()) {
      const currentCompletion = completion
      completion = undefined

      currentCompletion.resolve()
      return
    }

    const missing = [...expectedPaths].filter(
      cssPath =>
        !processedPaths.has(cssPath) &&
        !failedPaths.has(cssPath),
    )

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
    )

    const currentCompletion = completion
    completion = undefined

    currentCompletion.reject(error)
  }


  function allPathsResolved() {
    for (const cssPath of expectedPaths) {
      if (
        !processedPaths.has(cssPath) &&
        !failedPaths.has(cssPath)
      ) {
        return false
      }
    }
    return true
  }

  function tokensSucceeded() {
    return allPathsResolved() && failedPaths.size === 0
  }
}