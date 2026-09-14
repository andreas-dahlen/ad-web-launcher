import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSliderSizing } from '@primitives/Slider/hooks/useSliderSizing.hook.ts'
import { sliderStore } from '@primitives/Slider/store/slider.store.ts'

import { createResizeObserverMock } from '@test/testUtils/resizeObserver.utils.ts'

vi.mock('@primitives/Slider/store/slider.store', () => ({
  sliderStore: {
    getState: vi.fn()
  }
}))

describe('[USE SLIDER SIZING]', () => {
  let element: HTMLElement
  let thumbElement: HTMLElement

  let elRef: React.RefObject<HTMLElement | null>
  let thumbRef: React.RefObject<HTMLElement | null>

  let setLayout: ReturnType<typeof vi.fn>

  let resizeObserver: ReturnType<
    typeof createResizeObserverMock
  >

  beforeEach(() => {
    vi.clearAllMocks()

    element = document.createElement('div')
    thumbElement = document.createElement('div')

    document.body.appendChild(element)
    document.body.appendChild(thumbElement)

    elRef = {
      current: element
    }

    thumbRef = {
      current: thumbElement
    }

    setLayout = vi.fn()

    vi.mocked(sliderStore.getState).mockImplementation(
      () =>
        ({
          setLayout
        }) as never
    )

    resizeObserver = createResizeObserverMock()
  })

  afterEach(() => {
    element.remove()
    thumbElement.remove()
    vi.unstubAllGlobals()
  })

  it('measures the container and thumb on mount', () => {
    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 300
      },
      offsetHeight: {
        configurable: true,
        value: 40
      }
    })

    Object.defineProperties(thumbElement, {
      offsetWidth: {
        configurable: true,
        value: 50
      },
      offsetHeight: {
        configurable: true,
        value: 40
      }
    })

    renderHook(() =>
      useSliderSizing({
        elRef,
        thumbRef,
        id: 'test-slider'
      })
    )

    expect(setLayout).toHaveBeenCalledWith(
      'test-slider',
      {
        containerSize: {
          width: 300,
          height: 40
        },
        itemSize: {
          width: 50,
          height: 40
        }
      }
    )
  })

  it('observes both the container and thumb', () => {
    renderHook(() =>
      useSliderSizing({
        elRef,
        thumbRef,
        id: 'test-slider'
      })
    )

    expect(resizeObserver.observe).toHaveBeenCalledTimes(2)

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      1,
      element
    )

    expect(resizeObserver.observe).toHaveBeenNthCalledWith(
      2,
      thumbElement
    )
  })

  it('updates the layout when resized', () => {
    Object.defineProperties(element, {
      offsetWidth: {
        configurable: true,
        value: 300
      },
      offsetHeight: {
        configurable: true,
        value: 40
      }
    })

    Object.defineProperties(thumbElement, {
      offsetWidth: {
        configurable: true,
        value: 50
      },
      offsetHeight: {
        configurable: true,
        value: 40
      }
    })

    renderHook(() =>
      useSliderSizing({
        elRef,
        thumbRef,
        id: 'test-slider'
      })
    )

    setLayout.mockClear()

    Object.defineProperties(thumbElement, {
      offsetWidth: {
        configurable: true,
        value: 70
      },
      offsetHeight: {
        configurable: true,
        value: 50
      }
    })

    resizeObserver.trigger()

    expect(setLayout).toHaveBeenCalledWith(
      'test-slider',
      {
        containerSize: {
          width: 300,
          height: 40
        },
        itemSize: {
          width: 70,
          height: 50
        }
      }
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useSliderSizing({
        elRef,
        thumbRef,
        id: 'test-slider'
      })
    )

    unmount()

    expect(resizeObserver.disconnect).toHaveBeenCalledOnce()
  })

  it('does nothing when the container ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useSliderSizing({
        elRef: emptyRef,
        thumbRef,
        id: 'test-slider'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })

  it('does nothing when the thumb ref is empty', () => {
    const emptyRef: React.RefObject<HTMLElement | null> = {
      current: null
    }

    renderHook(() =>
      useSliderSizing({
        elRef,
        thumbRef: emptyRef,
        id: 'test-slider'
      })
    )

    expect(setLayout).not.toHaveBeenCalled()
    expect(resizeObserver.observe).not.toHaveBeenCalled()
  })
})