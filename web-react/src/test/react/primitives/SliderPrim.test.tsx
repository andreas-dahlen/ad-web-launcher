import { render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SliderPrim from '@primitives/Slider/SliderPrim'

import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook'
import { useSliderMotion } from '@primitives/Slider/hooks/useSliderMotion.hook'
import { useSliderSizing } from '@primitives/Slider/hooks/useSliderSizing.hook'
import type { SliderBinding } from '@primitives/Slider/store/slider.store'
import {
  slider_DEFAULTS,
  useSliderStore
} from '@primitives/Slider/store/useSliderStore.hook'

vi.mock('@interaction/adapter/usePointerBridge.hook', () => ({
  usePointerBridge: vi.fn()
}))

vi.mock('@primitives/Slider/hooks/useSliderSizing.hook', () => ({
  useSliderSizing: vi.fn()
}))

vi.mock('@primitives/Slider/hooks/useSliderMotion.hook', () => ({
  useSliderMotion: vi.fn()
}))

vi.mock(
  '@primitives/Slider/store/useSliderStore.hook',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@primitives/Slider/store/useSliderStore.hook')
      >()

    return {
      ...actual,
      useSliderStore: vi.fn()
    }
  }
)

function mockSliderStore(
  overrides: Partial<SliderBinding> = {}
) {
  vi.mocked(useSliderStore).mockReturnValue({
    ...slider_DEFAULTS,
    ...overrides,

    constraints: {
      ...slider_DEFAULTS.constraints,
      ...overrides.constraints
    },

    layout: {
      ...slider_DEFAULTS.layout,
      ...overrides.layout,

      containerSize: {
        ...slider_DEFAULTS.layout.containerSize,
        ...overrides.layout?.containerSize
      },

      itemSize: {
        ...slider_DEFAULTS.layout.itemSize,
        ...overrides.layout?.itemSize
      }
    }
  })
}

function renderSlider(
  props: Partial<ComponentProps<typeof SliderPrim>> = {}
) {
  return render(
    <SliderPrim
      id="test-slider"
      axis="horizontal"
      {...props}
    >
      Slider
    </SliderPrim>
  )
}

function getSlider(container: HTMLElement) {
  return container.firstElementChild as HTMLElement
}

function getTrack(container: HTMLElement) {
  return getSlider(container).firstElementChild as HTMLElement
}

function getThumb(container: HTMLElement) {
  return getSlider(container).lastElementChild as HTMLElement
}

function getBridgeOptions() {
  const calls = vi.mocked(usePointerBridge).mock.calls

  expect(calls).toHaveLength(1)

  return calls[0][0]
}

function getSizingOptions() {
  const calls = vi.mocked(useSliderSizing).mock.calls

  expect(calls).toHaveLength(1)

  return calls[0][0]
}

describe('[SLIDER PRIM]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSliderStore()

    vi.mocked(useSliderMotion).mockReturnValue({
      thumbStyle: {
        transform: 'translate3d(0px, 0px, 0px)',
        transition: 'none'
      }
    })

    vi.mocked(usePointerBridge).mockImplementation(() => { })
    vi.mocked(useSliderSizing).mockImplementation(() => { })
  })

  describe('rendering', () => {
    it('renders its children', () => {
      const { getByText } = renderSlider()

      expect(getByText('Slider')).toBeInTheDocument()
    })

    it('renders the slider element', () => {
      const { container } = renderSlider()

      expect(getSlider(container)).toBeInTheDocument()
    })

    it('renders the slider track', () => {
      const { container } = renderSlider()

      expect(getTrack(container)).toBeInTheDocument()
    })

    it('renders the slider thumb', () => {
      const { container } = renderSlider()

      expect(getThumb(container)).toBeInTheDocument()
    })

    it('renders slider data attributes', () => {
      const { container } = renderSlider()

      const slider = getSlider(container)

      expect(slider).toHaveAttribute(
        'data-id',
        'test-slider'
      )

      expect(slider).toHaveAttribute(
        'data-type',
        'slider'
      )

      expect(slider).toHaveAttribute(
        'data-axis',
        'horizontal'
      )

      expect(slider).toHaveAttribute(
        'data-frame',
        'slider'
      )
    })

    it('applies custom slider data attributes', () => {
      const { container } = renderSlider({
        sliderDataAttrs: {
          testId: 'slider-test',
          active: true
        }
      })

      const slider = getSlider(container)

      expect(slider).toHaveAttribute(
        'data-test-id',
        'slider-test'
      )

      expect(slider).toHaveAttribute(
        'data-active',
        'true'
      )
    })

    it('allows custom data attributes to override generated attributes', () => {
      const { container } = renderSlider({
        sliderDataAttrs: {
          type: 'custom',
          axis: 'vertical'
        }
      })

      const slider = getSlider(container)

      expect(slider).toHaveAttribute(
        'data-type',
        'custom'
      )

      expect(slider).toHaveAttribute(
        'data-axis',
        'vertical'
      )
    })
  })

  describe('interactive', () => {
    it('is interactive by default', () => {
      const { container } = renderSlider()

      expect(getSlider(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions().disabled).toBe(false)
    })

    it('enables pointer interaction when interactive is true', () => {
      const { container } = renderSlider({
        interactive: true
      })

      expect(getSlider(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions().disabled).toBe(false)
    })

    it('disables pointer interaction when interactive is false', () => {
      const { container } = renderSlider({
        interactive: false
      })

      expect(getSlider(container)).toHaveStyle({
        pointerEvents: 'none'
      })

      expect(getBridgeOptions().disabled).toBe(true)
    })
  })

  describe('positioning', () => {
    it('uses relative positioning by default', () => {
      const { container } = renderSlider()

      expect(getSlider(container)).toHaveStyle({
        position: 'relative'
      })
    })

    it('uses relative positioning when isInFlow is true', () => {
      const { container } = renderSlider({
        isInFlow: true
      })

      expect(getSlider(container)).toHaveStyle({
        position: 'relative'
      })
    })

    it('uses absolute positioning when isInFlow is false', () => {
      const { container } = renderSlider({
        isInFlow: false
      })

      expect(getSlider(container)).toHaveStyle({
        position: 'absolute'
      })
    })
  })

  describe('axis', () => {
    it('renders the configured horizontal axis', () => {
      const { container } = renderSlider({
        axis: 'horizontal'
      })

      expect(getSlider(container)).toHaveAttribute(
        'data-axis',
        'horizontal'
      )
    })

    it('renders the configured vertical axis', () => {
      const { container } = renderSlider({
        axis: 'vertical'
      })

      expect(getSlider(container)).toHaveAttribute(
        'data-axis',
        'vertical'
      )
    })
  })

  describe('instant swipe', () => {
    it('is enabled by default', () => {
      const { container } = renderSlider()

      expect(getSlider(container)).toHaveAttribute(
        'data-instant-swipe',
        'true'
      )
    })

    it('renders the configured instant swipe value', () => {
      const { container } = renderSlider({
        instantSwipe: false
      })

      expect(getSlider(container)).toHaveAttribute(
        'data-instant-swipe',
        'false'
      )
    })
  })

  describe('motion', () => {
    it('passes the current slider state to useSliderMotion', () => {
      mockSliderStore({
        value: 25,
        constraints: {
          min: 10,
          max: 90
        },
        layout: {
          containerSize: {
            width: 300,
            height: 100
          },
          itemSize: {
            width: 40,
            height: 40
          }
        },
        dragging: true
      })

      renderSlider({
        axis: 'horizontal'
      })

      expect(useSliderMotion).toHaveBeenCalledWith({
        position: 25,
        constraints: {
          min: 10,
          max: 90
        },
        axisSize: 300,
        axisitemSize: 40,
        dragging: true,
        isHorizontal: true
      })
    })

    it('uses the vertical layout dimensions for vertical sliders', () => {
      mockSliderStore({
        layout: {
          containerSize: {
            width: 300,
            height: 500
          },
          itemSize: {
            width: 40,
            height: 60
          }
        }
      })

      renderSlider({
        axis: 'vertical'
      })

      expect(useSliderMotion).toHaveBeenCalledWith(
        expect.objectContaining({
          axisSize: 500,
          axisitemSize: 60,
          isHorizontal: false
        })
      )
    })
  })

  describe('pointer bridge', () => {
    it('passes the slider ref to usePointerBridge', () => {
      const { container } = renderSlider()

      const { elRef } = getBridgeOptions()

      expect(elRef).toBeDefined()
      expect(elRef.current).toBe(
        getSlider(container)
      )
    })

    it('passes the interactive state to usePointerBridge', () => {
      renderSlider({
        interactive: false
      })

      expect(getBridgeOptions().disabled).toBe(true)
    })

    it('passes the enabled interactive state to usePointerBridge', () => {
      renderSlider({
        interactive: true
      })

      expect(getBridgeOptions().disabled).toBe(false)
    })

    it('provides an onReaction callback to usePointerBridge', () => {
      renderSlider()

      expect(getBridgeOptions().onReaction).toEqual(
        expect.any(Function)
      )
    })
  })

  describe('sizing', () => {
    it('passes the slider ref to useSliderSizing', () => {
      const { container } = renderSlider()

      const { elRef } = getSizingOptions()

      expect(elRef).toBeDefined()
      expect(elRef.current).toBe(
        getSlider(container)
      )
    })

    it('passes the thumb ref to useSliderSizing', () => {
      const { container } = renderSlider()

      const { thumbRef } = getSizingOptions()

      expect(thumbRef).toBeDefined()
      expect(thumbRef.current).toBe(
        getThumb(container)
      )
    })

    it('passes the slider id to useSliderSizing', () => {
      renderSlider()

      expect(getSizingOptions().id).toBe(
        'test-slider'
      )
    })
  })
})