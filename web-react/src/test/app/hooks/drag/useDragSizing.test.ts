import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDragSizing } from '@primitives/Drag/hooks/useDragSizing.hook'
import { dragStore } from '@primitives/Drag/store/drag.store'

import { createResizeObserverMock } from '@test/testUtils/resizeObserver.utils'

vi.mock('@primitives/Drag/store/drag.store', () => ({
  dragStore: {
    getState: vi.fn()
  }
}))

describe('[USE DRAG SIZING]', () => {
  let element: HTMLElement
  let containerElement: HTMLElement

  let elRef: React.RefObject<HTMLElement | null>
  let containerRef: React.RefObject<HTMLElement | null>

  let setLayout: ReturnType<typeof vi.fn>
  let setConstraints: ReturnType<typeof vi.fn>

  let resizeObserver: ReturnType<
    typeof createResizeObserverMock
  >

  beforeEach(() => {
    vi.clearAllMocks()

    element = document.createElement('div')
    containerElement = document.createElement('div')

    document.body.appendChild(element)
    document.body.appendChild(containerElement)

    elRef = {
      current: element
    }

    containerRef = {
      current: containerElement
    }

    setLayout = vi.fn()
    setConstraints = vi.fn()

    vi.mocked(dragStore.getState).mockImplementation(
      () =>
        ({
          setLayout,
          setConstraints
        }) as never
    )

    resizeObserver = createResizeObserverMock()
  })

  afterEach(() => {
    element.remove()
    containerElement.remove()
    vi.unstubAllGlobals()
  })

  it('measures the item and container on mount', () => {
    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 100
      },
      offsetHeight: {
        configurable: true,
        value: 200
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
      useDragSizing({
        elRef,
        containerRef,
        id: 'test-drag'
      })
    )

    expect(setLayout).toHaveBeenCalledWith(
      'test-drag',
      {
        containerSize: {
          width: 300,
          height: 500
        },
        itemSize: {
          width: 100,
          height: 200
        }
      }
    )
  })

  it('calculates drag constraints from item and container sizes', () => {
    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 100
      },
      offsetHeight: {
        configurable: true,
        value: 200
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
      useDragSizing({
        elRef,
        containerRef,
        id: 'test-drag'
      })
    )

    expect(setConstraints).toHaveBeenCalledWith(
      'test-drag',
      {
        minX: 0,
        minY: 0,
        maxX: 200,
        maxY: 300
      }
    )
  })

  it('observes both the item and container', () => {
    renderHook(() =>
      useDragSizing({
        elRef,
        containerRef,
        id: 'test-drag'
      })
    )

    expect(resizeObserver.observe).toHaveBeenCalledTimes(2)

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      1,
      element
    )

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      2,
      containerElement
    )
  })

  it('updates layout when either observed element resizes', () => {
    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 100
      },
      offsetHeight: {
        configurable: true,
        value: 200
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
      useDragSizing({
        elRef,
        containerRef,
        id: 'test-drag'
      })
    )

    setLayout.mockClear()
    setConstraints.mockClear()

    Object.defineProperties(containerElement, {
      offsetWidth: {
        configurable: true,
        value: 400
      },
      offsetHeight: {
        configurable: true,
        value: 600
      }
    })

    resizeObserver.trigger()

    expect(setLayout).toHaveBeenCalledWith(
      'test-drag',
      {
        containerSize: {
          width: 400,
          height: 600
        },
        itemSize: {
          width: 100,
          height: 200
        }
      }
    )

    expect(setConstraints).toHaveBeenCalledWith(
      'test-drag',
      {
        minX: 0,
        minY: 0,
        maxX: 300,
        maxY: 400
      }
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useDragSizing({
        elRef,
        containerRef,
        id: 'test-drag'
      })
    )

    unmount()

    expect(resizeObserver.disconnect).toHaveBeenCalledOnce()
  })

  it('does nothing when the item ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useDragSizing({
        elRef: emptyRef,
        containerRef,
        id: 'test-drag'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(setConstraints).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })

  it('does nothing when the container ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useDragSizing({
        elRef,
        containerRef: emptyRef,
        id: 'test-drag'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(setConstraints).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })
})