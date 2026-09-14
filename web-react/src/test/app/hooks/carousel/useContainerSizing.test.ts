import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useContainerSizing } from '@primitives/Carousel/hooks/useContainerSizing.hook.ts'
import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts'

import { createResizeObserverMock } from '@test/testUtils/resizeObserver.utils.ts'

vi.mock('@primitives/Carousel/store/carousel.store', () => ({
  carouselStore: {
    getState: vi.fn()
  }
}))

describe('[USE CONTAINER SIZING]', () => {
  let element: HTMLElement
  let elRef: React.RefObject<HTMLElement | null>

  let setContainerSize: ReturnType<typeof vi.fn>
  let resizeObserver: ReturnType<typeof createResizeObserverMock>

  beforeEach(() => {
    vi.clearAllMocks()

    element = document.createElement('div')
    document.body.appendChild(element)

    elRef = {
      current: element
    }

    setContainerSize = vi.fn()

    vi.mocked(carouselStore.getState).mockImplementation(
      () =>
        ({
          setContainerSize
        }) as never
    )

    resizeObserver = createResizeObserverMock()
  })

  afterEach(() => {
    element.remove()
    vi.unstubAllGlobals()
  })

  it('measures the container on mount', () => {
    Object.defineProperties(element, {
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
      useContainerSizing({
        elRef,
        id: 'test-carousel'
      })
    )

    expect(setContainerSize).toHaveBeenCalledWith(
      'test-carousel',
      {
        width: 300,
        height: 500
      }
    )
  })

  it('observes the container', () => {
    renderHook(() =>
      useContainerSizing({
        elRef,
        id: 'test-carousel'
      })
    )

    expect(resizeObserver.observe).toHaveBeenCalledWith(
      element
    )
  })

  it('updates the container size when resized', () => {
    Object.defineProperties(element, {
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
      useContainerSizing({
        elRef,
        id: 'test-carousel'
      })
    )

    setContainerSize.mockClear()

    Object.defineProperties(element, {
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

    expect(setContainerSize).toHaveBeenCalledWith(
      'test-carousel',
      {
        width: 400,
        height: 600
      }
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useContainerSizing({
        elRef,
        id: 'test-carousel'
      })
    )

    unmount()

    expect(resizeObserver.disconnect).toHaveBeenCalledOnce()
  })

  it('does not measure or observe when the ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useContainerSizing({
        elRef: emptyRef,
        id: 'test-carousel'
      })
    )

    expect(setContainerSize).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })
})