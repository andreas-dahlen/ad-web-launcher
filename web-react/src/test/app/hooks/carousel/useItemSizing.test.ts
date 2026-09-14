import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useItemSizing } from '@primitives/Carousel/hooks/useItemSizing.hook.ts'
import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts'

import { createResizeObserverMock } from '@test/testUtils/resizeObserver.utils.ts'

vi.mock('@primitives/Carousel/store/carousel.store', () => ({
  carouselStore: {
    getState: vi.fn()
  }
}))

describe('[USE ITEM SIZING]', () => {
  let element: HTMLElement
  let itemRef: React.RefObject<HTMLElement | null>

  let setItemSize: ReturnType<typeof vi.fn>
  let resizeObserver: ReturnType<typeof createResizeObserverMock>

  beforeEach(() => {
    vi.clearAllMocks()

    element = document.createElement('div')
    document.body.appendChild(element)

    itemRef = {
      current: element
    }

    setItemSize = vi.fn()

    vi.mocked(carouselStore.getState).mockImplementation(
      () =>
        ({
          setItemSize
        }) as never
    )

    resizeObserver = createResizeObserverMock()
  })

  afterEach(() => {
    element.remove()
    vi.unstubAllGlobals()
  })

  it('measures the item on mount', () => {
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

    renderHook(() =>
      useItemSizing({
        itemRef,
        id: 'test-carousel'
      })
    )

    expect(setItemSize).toHaveBeenCalledWith(
      'test-carousel',
      {
        width: 100,
        height: 200
      }
    )
  })

  it('observes the item', () => {
    renderHook(() =>
      useItemSizing({
        itemRef,
        id: 'test-carousel'
      })
    )

    expect(resizeObserver.observe).toHaveBeenCalledWith(
      element
    )
  })

  it('updates the item size when resized', () => {
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

    renderHook(() =>
      useItemSizing({
        itemRef,
        id: 'test-carousel'
      })
    )

    setItemSize.mockClear()

    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 150
      },
      offsetHeight: {
        configurable: true,
        value: 250
      }
    })

    resizeObserver.trigger()

    expect(setItemSize).toHaveBeenCalledWith(
      'test-carousel',
      {
        width: 150,
        height: 250
      }
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useItemSizing({
        itemRef,
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
      useItemSizing({
        itemRef: emptyRef,
        id: 'test-carousel'
      })
    )

    expect(setItemSize).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })
})