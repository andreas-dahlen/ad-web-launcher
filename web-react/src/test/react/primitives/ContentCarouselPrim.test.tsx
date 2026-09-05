import { render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ContentCarouselPrim from '@primitives/Carousel/ContentCarouselPrim.tsx'

import { useCarouselMotion } from '@primitives/Carousel/hooks/useCarouselMotion.hook.ts'
import { useItemSizing } from '@primitives/Carousel/hooks/useItemSizing.hook.ts'
import { useCarouselStore } from '@primitives/Carousel/store/useCarouselStore.hook.ts'
import { carouselStore, type CarouselStore } from '@primitives/Carousel/store/carousel.store.ts'

import { svsx } from '@shared/sxCompiler/svsx.ts'

import css from '../../../primitives/Carousel/Carousel.module.css'

import { carousel_DEFAULTS } from '@primitives/Carousel/store/useCarouselStore.hook.ts'

vi.mock('@primitives/Carousel/hooks/useCarouselMotion.hook', () => ({
  useCarouselMotion: vi.fn()
}))

vi.mock('@primitives/Carousel/hooks/useItemSizing.hook', () => ({
  useItemSizing: vi.fn()
}))

vi.mock('@shared/sxCompiler/svsx', () => ({
  svsx: vi.fn()
}))

vi.mock(
  '@primitives/Carousel/store/useCarouselStore.hook',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@primitives/Carousel/store/useCarouselStore.hook')
      >()

    return {
      ...actual,
      useCarouselStore: vi.fn()
    }
  }
)

vi.mock(
  '@primitives/Carousel/store/carousel.store',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@primitives/Carousel/store/carousel.store')
      >()

    return {
      ...actual,
      carouselStore: {
        ...actual.carouselStore,
        getState: vi.fn()
      }
    }
  }
)

describe('[CONTENT CAROUSEL PRIM]', () => {

  beforeEach(() => {
    vi.clearAllMocks()

    mockCarouselStore()

    mockCarouselActions()

    vi.mocked(svsx).mockReturnValue({})

    vi.mocked(useItemSizing).mockImplementation(() => { })

    vi.mocked(useCarouselMotion).mockReturnValue({
      styleForRole: vi.fn((role) => ({
        transform:
          role === 'current'
            ? 'translate3d(0px, 0px, 0px)'
            : (role === 'next'
              ? 'translate3d(100px, 0px, 0px)'
              : 'translate3d(-100px, 0px, 0px)'),
        transition: 'none'
      })),
      onTransitionEnd: vi.fn()
    })
  })

  function mockCarouselActions() {
    const setCount = vi.fn()

    vi.mocked(carouselStore.getState).mockImplementation(
      () => ({
        setCount
      } as unknown as CarouselStore)
    )

    return { setCount }
  }

  function renderCarousel(
    props: Partial<ComponentProps<typeof ContentCarouselPrim>> = {}
  ) {
    return render(
      <ContentCarouselPrim
        id="test-carousel"
        axis="horizontal"
        scenes={[
          <div key="scene-0">Scene 0</div>,
          <div key="scene-1">Scene 1</div>,
          <div key="scene-2">Scene 2</div>
        ]}
        {...props}
      />
    )
  }

  function mockCarouselStore(
    overrides: Partial<ReturnType<typeof useCarouselStore>> = {}
  ) {
    vi.mocked(useCarouselStore).mockReturnValue({
      ...carousel_DEFAULTS,
      ...overrides,

      layout: {
        ...carousel_DEFAULTS.layout,
        ...overrides.layout,

        containerSize: {
          ...carousel_DEFAULTS.layout.containerSize,
          ...overrides.layout?.containerSize
        },

        itemSize: {
          ...carousel_DEFAULTS.layout.itemSize,
          ...overrides.layout?.itemSize
        }
      },

      nodeBindings: {
        ...carousel_DEFAULTS.nodeBindings,
        ...overrides.nodeBindings,

        nodes:
          overrides.nodeBindings?.nodes ??
          carousel_DEFAULTS.nodeBindings.nodes
      }
    })
  }

  function getCarousel(container: HTMLElement) {
    return container.firstElementChild as HTMLElement
  }

  function getScenes(container: HTMLElement) {
    return [...getCarousel(container).children]
  }

  function getScene(
    container: HTMLElement,
    index: number
  ) {
    return getScenes(container)[index] as HTMLElement
  }

  function getSizingOptions() {
    const calls = vi.mocked(useItemSizing).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  function getMotionOptions() {
    const calls = vi.mocked(useCarouselMotion).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  describe('rendering', () => {
    it('renders the carousel', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toBeInTheDocument()
    })

    it('renders three scene nodes', () => {
      const { container } = renderCarousel()

      expect(getScenes(container)).toHaveLength(3)
    })

    it('renders scene content according to sceneIdx', () => {
      const { container } = renderCarousel({
        scenes: [
          <div key="first">First</div>,
          <div key="second">Second</div>,
          <div key="third">Third</div>
        ]
      })

      const scenes = getScenes(container)

      expect(scenes[0]).toHaveTextContent('First')
      expect(scenes[1]).toHaveTextContent('Second')
      expect(scenes[2]).toHaveTextContent('Third')
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

    it('disables pointer interaction on the content carousel', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toHaveStyle({
        pointerEvents: 'none'
      })
    })
  })

  describe('css', () => {
    it('has carousel css module on container', () => {
      const { container } = renderCarousel()

      expect(getCarousel(container)).toHaveClass(
        css.carousel
      )
    })

    it('has scene css module on every scene', () => {
      const { container } = renderCarousel()

      for (const scene of getScenes(container)) {
        expect(scene).toHaveClass(css.scene)
      }
    })
  })

  describe('data attributes', () => {
    it('applies custom carousel data attributes', () => {
      const { container } = renderCarousel({
        carouselDataAttrs: {
          testId: 'carousel-test',
          active: true
        }
      })

      const carousel = getCarousel(container)

      expect(carousel).toHaveAttribute(
        'data-test-id',
        'carousel-test'
      )

      expect(carousel).toHaveAttribute(
        'data-active',
        'true'
      )
    })

    it('allows custom data attributes to override generated attributes', () => {
      const { container } = renderCarousel({
        carouselDataAttrs: {
          type: 'custom',
          axis: 'vertical'
        }
      })

      const carousel = getCarousel(container)

      expect(carousel).toHaveAttribute(
        'data-type',
        'custom'
      )

      expect(carousel).toHaveAttribute(
        'data-axis',
        'vertical'
      )
    })
  })

  describe('roles', () => {
    it('assigns current to the current node', () => {
      const { container } = renderCarousel()

      expect(getScene(container, 0)).toHaveAttribute(
        'data-role',
        'current'
      )
    })

    it('assigns next to the node after the current node', () => {
      const { container } = renderCarousel()

      expect(getScene(container, 1)).toHaveAttribute(
        'data-role',
        'next'
      )
    })

    it('assigns prev to the node before the current node', () => {
      const { container } = renderCarousel()

      expect(getScene(container, 2)).toHaveAttribute(
        'data-role',
        'prev'
      )
    })

    it('derives roles from currentNode', () => {
      mockCarouselStore({
        nodeBindings: {
          currentNode: 1,
          nodes: [
            { nodeId: 0, sceneIdx: 0 },
            { nodeId: 1, sceneIdx: 1 },
            { nodeId: 2, sceneIdx: 2 }
          ]
        }
      })

      const { container } = renderCarousel()

      expect(getScene(container, 0)).toHaveAttribute(
        'data-role',
        'prev'
      )

      expect(getScene(container, 1)).toHaveAttribute(
        'data-role',
        'current'
      )

      expect(getScene(container, 2)).toHaveAttribute(
        'data-role',
        'next'
      )
    })
  })

  describe('container sizing', () => {
    it('passes the scene ref and id to useItemSizing', () => {
      const { container } = renderCarousel()

      const { itemRef } = getSizingOptions()

      expect(itemRef).toBeDefined()
      expect(itemRef.current).toBe(
        getScene(container, 2)
      )
    })

    it('passes the carousel id to useItemSizing', () => {
      renderCarousel()

      expect(getSizingOptions()).toEqual(
        expect.objectContaining({
          id: 'test-carousel'
        })
      )
    })
  })

  describe('motion', () => {
    it('passes carousel motion state to useMotion', () => {
      mockCarouselStore({
        liveOffset: 25,
        dragging: true,
        settling: false
      })

      renderCarousel()

      expect(getMotionOptions()).toEqual(
        expect.objectContaining({
          store: {
            liveOffset: 25,
            dragging: true,
            settling: false
          }
        })
      )
    })

    it('uses container width for horizontal motion', () => {
      mockCarouselStore({
        layout: {
          containerSize: {
            width: 300,
            height: 500
          },
          itemSize: {
            width: 100,
            height: 200
          }
        }
      })

      renderCarousel({
        axis: 'horizontal'
      })

      expect(getMotionOptions()).toEqual(
        expect.objectContaining({
          axisSize: 300,
          horizontal: true
        })
      )
    })

    it('uses container height for vertical motion', () => {
      mockCarouselStore({
        layout: {
          containerSize: {
            width: 300,
            height: 500
          },
          itemSize: {
            width: 100,
            height: 200
          }
        }
      })

      renderCarousel({
        axis: 'vertical'
      })

      expect(getMotionOptions()).toEqual(
        expect.objectContaining({
          axisSize: 500,
          horizontal: false
        })
      )
    })

    it('passes the carousel id to useMotion', () => {
      renderCarousel()

      expect(getMotionOptions()).toEqual(
        expect.objectContaining({
          id: 'test-carousel'
        })
      )
    })

    it('uses the motion style for each scene role', () => {
      const { container } = renderCarousel()

      expect(getScene(container, 0)).toHaveStyle({
        transform: 'translate3d(0px, 0px, 0px)',
        transition: 'none'
      })

      expect(getScene(container, 1)).toHaveStyle({
        transform: 'translate3d(100px, 0px, 0px)',
        transition: 'none'
      })

      expect(getScene(container, 2)).toHaveStyle({
        transform: 'translate3d(-100px, 0px, 0px)',
        transition: 'none'
      })
    })
  })

  describe('count synchronization', () => {
    it('sets carousel count from the scene count', () => {
      const { setCount } = mockCarouselActions()

      renderCarousel({
        scenes: [
          <div key="0">Scene 0</div>,
          <div key="1">Scene 1</div>,
          <div key="2">Scene 2</div>,
          <div key="3">Scene 3</div>
        ]
      })

      expect(setCount).toHaveBeenCalledWith(
        'test-carousel',
        4
      )
    })

    it('does not set count when there are no scenes', () => {
      const { setCount } = mockCarouselActions()

      renderCarousel({
        scenes: []
      })

      expect(setCount).not.toHaveBeenCalled()
    })
  })
})