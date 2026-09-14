import { vi } from 'vitest'
type ResizeObserverMock = {
  ResizeObserverMock: ReturnType<typeof vi.fn>
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  trigger: () => void
}

export function createResizeObserverMock(): ResizeObserverMock {
  let callback: ResizeObserverCallback | undefined

  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()

  const ResizeObserverMock = vi.fn(function (
    cb: ResizeObserverCallback
  ) {
    callback = cb

    return {
      observe,
      unobserve,
      disconnect
    }
  })

  vi.stubGlobal('ResizeObserver', ResizeObserverMock)

  return {
    ResizeObserverMock,
    observe,
    unobserve,
    disconnect,

    trigger() {
      callback?.([], {} as ResizeObserver)
    }
  }
}