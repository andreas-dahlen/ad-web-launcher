const POST_CSS_FLUSH_DELAY_MS = 500

export function createProcessingTracker(expectedCssPaths: string[]) {
  const expectedPaths = new Set(expectedCssPaths)
  const resolvedPaths = new Set<string>()

  let postCssTimer: ReturnType<typeof setTimeout> | undefined

  let completion:
    | {
      resolve: () => void
      reject: (error: unknown) => void
    }
    | undefined

  function schedulePostCssFlush() {
    if (postCssTimer) clearTimeout(postCssTimer)
    postCssTimer = setTimeout(flushPostCss, POST_CSS_FLUSH_DELAY_MS)
  }

  function flushPostCss() {
    postCssTimer = undefined

    if (!completion) {
      return
    }

    // eslint-disable-next-line unicorn/prefer-set-methods
    const unresolvedPaths = [...expectedPaths].filter(
      cssPath => !resolvedPaths.has(cssPath))

    const currentCompletion = completion
    completion = undefined

    if (unresolvedPaths.length === 0) {
      currentCompletion.resolve()
      return
    }
    currentCompletion.reject(
      new Error(
        [
          "❌ Style token compilation stalled",
          "",
          "Unresolved CSS modules:",
          ...unresolvedPaths.map(path => `  • ${path}`),
          "",
          "Possible causes:",
          "  • CSS module is not imported",
          "  • PostCSS did not process the module",
          "  • processing exited early",
          "  • cache issue",
          "",
        ].join("\n")
      )
    )
  }
  return {
    invalidate(cssPath: string) {
      expectedPaths.add(cssPath)
      resolvedPaths.delete(cssPath)

      schedulePostCssFlush()
    },

    markResolved(cssPath: string) {
      resolvedPaths.add(cssPath)

      schedulePostCssFlush()
    },

    notifyPostCssActivity() {
      schedulePostCssFlush()
    },

    awaitPostCssCompletion(): Promise<void> {
      return new Promise((resolve, reject) => {
        completion = { resolve, reject }
        schedulePostCssFlush()
      })
    },

    __TEST_ONLY_API: () => ({
      expectedPaths: new Set(expectedPaths),
      resolvedPaths: new Set(resolvedPaths)
    })
  }
}