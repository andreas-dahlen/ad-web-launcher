import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useScrollSizing } from '@primitives/Scroll/hooks/useScrollSizing.hook'
import { scrollStore } from '@primitives/Scroll/store/scroll.store'

import { createResizeObserverMock } from '@test/testUtils/resizeObserver.utils'

vi.mock('@primitives/Scroll/store/scroll.store', () => ({
  scrollStore: {
    getState: vi.fn()
  }
}))

describe('[USE SCROLL SIZING]', () => {
  let contentElement: HTMLElement
  let containerElement: HTMLElement

  let contentRef: React.RefObject<HTMLElement | null>
  let containerRef: React.RefObject<HTMLElement | null>

  let setLayout: ReturnType<typeof vi.fn>

  let resizeObserver: ReturnType<
    typeof createResizeObserverMock
  >

  beforeEach(() => {
    vi.clearAllMocks()

    contentElement = document.createElement('div')
    containerElement = document.createElement('div')

    document.body.appendChild(contentElement)
    document.body.appendChild(containerElement)

    contentRef = {
      current: contentElement
    }

    containerRef = {
      current: containerElement
    }

    setLayout = vi.fn()

    vi.mocked(scrollStore.getState).mockImplementation(
      () =>
        ({
          setLayout
        }) as never
    )

    resizeObserver = createResizeObserverMock()
  })

  afterEach(() => {
    contentElement.remove()
    containerElement.remove()
    vi.unstubAllGlobals()
  })

  it('measures content and container on mount', () => {
    Object.defineProperties(contentElement, {
      offsetWidth: {
        configurable: true,
        value: 600
      },
      offsetHeight: {
        configurable: true,
        value: 800
      }
    })

    Object.defineProperties(containerElement, {
      offsetWidth: {
        configurable: true,
        value: 300
      },
      offsetHeight: {
        configurable: true,
        value: 500
      }
    })

    renderHook(() =>
      useScrollSizing({
        contentRef,
        containerRef,
        id: 'test-scroll'
      })
    )

    expect(setLayout).toHaveBeenCalledWith(
      'test-scroll',
      {
        containerSize: {
          width: 300,
          height: 500
        },
        itemSize: {
          width: 600,
          height: 800
        }
      }
    )
  })

  it('observes both content and container', () => {
    renderHook(() =>
      useScrollSizing({
        contentRef,
        containerRef,
        id: 'test-scroll'
      })
    )

    expect(resizeObserver.observe).toHaveBeenCalledTimes(2)

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      1,
      contentElement
    )

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      2,
      containerElement
    )
  })

  it('updates the layout when resized', () => {
    Object.defineProperties(contentElement, {
      offsetWidth: {
        configurable: true,
        value: 600
      },
      offsetHeight: {
        configurable: true,
        value: 800
      }
    })

    Object.defineProperties(containerElement, {
      offsetWidth: {
        configurable: true,
        value: 300
      },
      offsetHeight: {
        configurable: true,
        value: 500
      }
    })

    renderHook(() =>
      useScrollSizing({
        contentRef,
        containerRef,
        id: 'test-scroll'
      })
    )

    setLayout.mockClear()

    Object.defineProperties(contentElement, {
      offsetWidth: {
        configurable: true,
        value: 700
      },
      offsetHeight: {
        configurable: true,
        value: 900
      }
    })

    resizeObserver.trigger()

    expect(setLayout).toHaveBeenCalledWith(
      'test-scroll',
      {
        containerSize: {
          width: 300,
          height: 500
        },
        itemSize: {
          width: 700,
          height: 900
        }
      }
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useScrollSizing({
        contentRef,
        containerRef,
        id: 'test-scroll'
      })
    )

    unmount()

    expect(resizeObserver.disconnect).toHaveBeenCalledOnce()
  })

  it('does nothing when the content ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useScrollSizing({
        contentRef: emptyRef,
        containerRef,
        id: 'test-scroll'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })

  it('does nothing when the container ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useScrollSizing({
        contentRef,
        containerRef: emptyRef,
        id: 'test-scroll'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })
})