import { render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import css from '../../../primitives/Carousel/Carousel.module.css'

import InputCarouselPrim from '@primitives/Carousel/InputCarouselPrim.tsx'

import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useContainerSizing } from '@primitives/Carousel/hooks/useContainerSizing.hook.ts'

import type { EventType } from '@shared/types/core.types.ts'

vi.mock('@interaction/adapter/usePointerBridge.hook', () => ({
  usePointerBridge: vi.fn()
}))

vi.mock('@primitives/Carousel/hooks/useContainerSizing.hook', () => ({
  useContainerSizing: vi.fn()
}))

describe('[INPUT CAROUSEL PRIM]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(usePointerBridge).mockImplementation(() => { })
    vi.mocked(useContainerSizing).mockImplementation(() => { })
  })

  function renderCarousel(
    props: Partial<ComponentProps<typeof InputCarouselPrim>> = {}
  ) {
    return render(
      <InputCarouselPrim
        id="test-carousel"
        axis="horizontal"
        {...props}
      />
    )
  }

  function getCarousel(container: HTMLElement) {
    return container.firstElementChild as HTMLElement
  }

  function getScene(container: HTMLElement) {
    return getCarousel(container).firstElementChild as HTMLElement
  }

  function getBridgeOptions() {
    const calls = vi.mocked(usePointerBridge).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  function getSizingOptions() {
    const calls = vi.mocked(useContainerSizing).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  describe('rendering', () => {
    it('renders the carousel', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toBeInTheDocument()
    })

    it('renders the scene', () => {
      const { container } = renderCarousel()

      expect(getScene(container)).toBeInTheDocument()
    })

    it('renders carousel data attributes', () => {
      const { container } = renderCarousel()

      const carousel = getCarousel(container)

      expect(carousel).toHaveAttribute(
        'data-id',
        'test-carousel'
      )

      expect(carousel).toHaveAttribute(
        'data-type',
        'carousel'
      )

      expect(carousel).toHaveAttribute(
        'data-axis',
        'horizontal'
      )

      expect(carousel).toHaveAttribute(
        'data-frame',
        'carousel'
      )
    })

    it('renders the configured axis', () => {
      const { container } = renderCarousel({
        axis: 'vertical'
      })

      expect(getCarousel(container)).toHaveAttribute(
        'data-axis',
        'vertical'
      )
    })

    it('enables pointer interaction on the carousel', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toHaveStyle({
        pointerEvents: 'auto'
      })
    })
  })

  describe('lock configuration', () => {
    it('renders lock thresholds', () => {
      const { container } = renderCarousel({
        lockPrevAt: 2,
        lockNextAt: 7
      })

      const carousel = getCarousel(container)

      expect(carousel).toHaveAttribute(
        'data-lock-prev-at',
        '2'
      )

      expect(carousel).toHaveAttribute(
        'data-lock-next-at',
        '7'
      )
    })

    it('does not render lock attributes when they are not provided', () => {
      const { container } = renderCarousel()

      const carousel = getCarousel(container)

      expect(carousel).not.toHaveAttribute(
        'data-lock-prev-at'
      )

      expect(carousel).not.toHaveAttribute(
        'data-lock-next-at'
      )
    })
  })

  describe('container sizing', () => {
    it('passes the carousel ref and id to useContainerSizing', () => {
      const { container } = renderCarousel()

      const { elRef } = getSizingOptions()

      expect(elRef).toBeDefined()
      expect(elRef.current).toBe(
        getCarousel(container)
      )

    })

    it('passes the carousel id to useContainerSizing', () => {
      renderCarousel()

      expect(getSizingOptions()).toEqual(
        expect.objectContaining({
          id: 'test-carousel'
        })
      )
    })
  })

  describe('pointer bridge', () => {
    it('passes the carousel ref to usePointerBridge', () => {
      const { container } = renderCarousel()

      const { elRef } = getBridgeOptions()
      const carousel = getCarousel(container)

      expect(elRef).toBeDefined()
      expect(elRef.current).toBe(carousel)
    })

    it('enables the pointer bridge', () => {
      renderCarousel()

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('provides a reaction handler', () => {
      renderCarousel()

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          onReaction: expect.any(Function)
        })
      )
    })
  })

  describe('swipe commit', () => {
    it('calls onSwipeCommit for a swipeCommit reaction', () => {
      const onSwipeCommit = vi.fn()

      renderCarousel({
        onSwipeCommit
      })

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'swipeCommit' as EventType
      })

      onReaction?.(reaction)

      expect(onSwipeCommit).toHaveBeenCalledTimes(1)
      expect(onSwipeCommit).toHaveBeenCalledWith(
        'swipeCommit'
      )
    })

    it('ignores reactions other than swipeCommit', () => {
      const onSwipeCommit = vi.fn()

      renderCarousel({
        onSwipeCommit
      })

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'pressRelease' as EventType
      })

      onReaction?.(reaction)

      expect(onSwipeCommit).not.toHaveBeenCalled()
    })

    it('does nothing when onSwipeCommit is not provided', () => {
      renderCarousel()

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'swipeCommit' as EventType
      })

      expect(() => {
        onReaction?.(reaction)
      }).not.toThrow()
    })
  })

  describe('css', () => {
    it('has carousel css module on container', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toHaveClass(css.carousel)
    })
  })
})