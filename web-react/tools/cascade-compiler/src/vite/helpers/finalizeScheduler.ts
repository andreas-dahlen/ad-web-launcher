
const VITE_FLUSH_DELAY_MS = 500
export function createFinalizeScheduler(finalize: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  function schedule() {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = undefined
      finalize()
    }, VITE_FLUSH_DELAY_MS)
  }

  return { schedule }
}