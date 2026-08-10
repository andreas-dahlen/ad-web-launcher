import { vi } from 'vitest'

export function createResizeObserverMock() {
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