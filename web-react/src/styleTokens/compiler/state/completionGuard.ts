
/**
 * Ensures completion handling runs once per compiler cycle.
 *
 * Multiple callbacks may reach the completed state,
 * but only the first completion signal triggers build and diagnostics.
 */
export function createCompletionGuard() {
  let canCompleted = false

  return {
    reset() {
      canCompleted = false
    },

    canComplete() {
      if (canCompleted) return false

      canCompleted = true
      return true
    }
  }
}