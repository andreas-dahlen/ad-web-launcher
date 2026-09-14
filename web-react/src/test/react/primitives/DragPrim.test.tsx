import { render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DragPrim from '@primitives/Drag/DragPrim.tsx'

import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import { useDragSizing } from '@primitives/Drag/hooks/useDragSizing.hook.ts'
import { useDragMotion } from '@primitives/Drag/hooks/useDragMotion.hook.ts'


import type { DragBinding } from '@primitives/Drag/store/drag.store.ts'

import {
  settingsStore,
  type ReactiveSettings
} from '@stores/settings.store.ts'

import type { EventType } from '@shared/types/core.types.ts'

import { settingsStore_DEFAULT } from './store.fixture.ts'
import { drag_DEFAULTS, useDragStore } from '@primitives/Drag/store/useDragStore.hook.ts'

vi.mock('@interaction/adapter/usePointerBridge.hook', () => ({
  usePointerBridge: vi.fn()
}))

vi.mock('@primitives/Drag/hooks/useDragSizing.hook', () => ({
  useDragSizing: vi.fn()
}))

vi.mock('@primitives/Drag/hooks/useDragMotion.hook', () => ({
  useDragMotion: vi.fn()
}))

vi.mock('@primitives/Drag/store/useDragStore.hook', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@primitives/Drag/store/useDragStore.hook')>()

  return {
    ...actual,
    useDragStore: vi.fn()
  }
})

vi.mock('@stores/settings.store', () => ({
  settingsStore: vi.fn()
}))

function mockSettings(
  overrides: Partial<ReactiveSettings> = {}
) {
  vi.mocked(settingsStore).mockImplementation((selector) =>
    selector({
      settings: {
        ...settingsStore_DEFAULT,
        ...overrides
      },
      update: vi.fn()
    })
  )
}

function mockDragStore(
  overrides: Partial<DragBinding> = {}
) {
  vi.mocked(useDragStore).mockReturnValue({
    ...drag_DEFAULTS,
    ...overrides,

    layout: {
      ...drag_DEFAULTS.layout,
      ...overrides.layout,

      containerSize: {
        ...drag_DEFAULTS.layout.containerSize,
        ...overrides.layout?.containerSize
      },

      itemSize: {
        ...drag_DEFAULTS.layout.itemSize,
        ...overrides.layout?.itemSize
      }
    },

    constraints: {
      ...drag_DEFAULTS.constraints,
      ...overrides.constraints
    },

    frameRect: {
      ...drag_DEFAULTS.frameRect,
      ...overrides.frameRect
    }
  })
}

describe('[DRAG PRIM]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockDragStore()

    vi.mocked(useDragMotion).mockReturnValue({
      motionStyle: {
        transform: 'translate3d(0px, 0px, 0px)',
        transition: 'none',
        zIndex: 20
      }
    })

    vi.mocked(usePointerBridge).mockImplementation(() => { })
    vi.mocked(useDragSizing).mockImplementation(() => { })

    mockSettings()
  })

  function renderDrag(
    props: Partial<ComponentProps<typeof DragPrim>> = {}
  ) {
    return render(
      <DragPrim
        id="test-drag"
        {...props}
      >
        Drag
      </DragPrim>
    )
  }

  function getContainer(container: HTMLElement) {
    return container.firstElementChild as HTMLElement
  }

  function getDrag(container: HTMLElement) {
    return getContainer(container).firstElementChild as HTMLElement
  }

  function getBridgeOptions() {
    const calls = vi.mocked(usePointerBridge).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  describe('rendering', () => {
    it('renders its children', () => {
      const { getByText } = renderDrag()

      expect(getByText('Drag')).toBeInTheDocument()
    })

    it('renders the drag frame', () => {
      const { container } = renderDrag()

      expect(getContainer(container)).toHaveAttribute(
        'data-frame',
        'drag'
      )
    })

    it('renders drag data attributes', () => {
      const { container } = renderDrag()

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-id',
        'test-drag'
      )

      expect(drag).toHaveAttribute(
        'data-type',
        'drag'
      )

      expect(drag).toHaveAttribute(
        'data-axis',
        'both'
      )
    })

    it('applies custom drag data attributes', () => {
      const { container } = renderDrag({
        dragDataAttrs: {
          testId: 'drag-test',
          active: true
        }
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-test-id',
        'drag-test'
      )

      expect(drag).toHaveAttribute(
        'data-active',
        'true'
      )
    })

    it('allows custom drag data attributes to override generated attributes', () => {
      const { container } = renderDrag({
        dragDataAttrs: {
          type: 'custom',
          axis: 'horizontal'
        }
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-type',
        'custom'
      )

      expect(drag).toHaveAttribute(
        'data-axis',
        'horizontal'
      )
    })
  })

  describe('interactive', () => {
    it('is interactive by default', () => {
      const { container } = renderDrag()

      expect(getDrag(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('enables pointer interaction when interactive is true', () => {
      const { container } = renderDrag({
        interactive: true
      })

      expect(getDrag(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('disables pointer interaction when interactive is false', () => {
      const { container } = renderDrag({
        interactive: false
      })

      expect(getDrag(container)).toHaveStyle({
        pointerEvents: 'none'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: true
        })
      )
    })
  })

  describe('positioning', () => {
    it('uses absolute positioning by default', () => {
      const { container } = renderDrag()

      expect(getContainer(container)).toHaveStyle({
        position: 'absolute'
      })
    })

    it('uses relative positioning when isInFlow is true', () => {
      const { container } = renderDrag({
        isInFlow: true
      })

      expect(getContainer(container)).toHaveStyle({
        position: 'relative'
      })
    })

    it('uses absolute positioning when isInFlow is false', () => {
      const { container } = renderDrag({
        isInFlow: false
      })

      expect(getContainer(container)).toHaveStyle({
        position: 'absolute'
      })
    })
  })

  describe('snap configuration', () => {
    it('renders snap values from props', () => {
      const { container } = renderDrag({
        snapX: 25,
        snapY: 50
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-snap-x',
        '25'
      )

      expect(drag).toHaveAttribute(
        'data-snap-y',
        '50'
      )
    })

    it('does not use settings snap values when useSettingsSnap is false', () => {
      mockSettings({
        snapEnabled: true,
        dragSnapX: 100,
        dragSnapY: 200
      })

      const { container } = renderDrag({
        snapX: 25,
        snapY: 50,
        useSettingsSnap: false
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-snap-x',
        '25'
      )

      expect(drag).toHaveAttribute(
        'data-snap-y',
        '50'
      )
    })

    it('uses settings snap values when snap is enabled', () => {
      mockSettings({
        snapEnabled: true,
        dragSnapX: 100,
        dragSnapY: 200
      })

      const { container } = renderDrag({
        useSettingsSnap: true
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-snap-x',
        '100'
      )

      expect(drag).toHaveAttribute(
        'data-snap-y',
        '200'
      )
    })

    it('uses prop snap values when settings snap is disabled', () => {
      mockSettings({
        snapEnabled: false,
        dragSnapX: 100,
        dragSnapY: 200
      })

      const { container } = renderDrag({
        snapX: 25,
        snapY: 50,
        useSettingsSnap: true
      })

      const drag = getDrag(container)

      expect(drag).toHaveAttribute(
        'data-snap-x',
        '25'
      )

      expect(drag).toHaveAttribute(
        'data-snap-y',
        '50'
      )
    })
  })

  describe('pointer bridge', () => {
    it('passes the drag ref to usePointerBridge', () => {
      const { container } = renderDrag()

      const { elRef } = getBridgeOptions()
      const drag = getDrag(container)

      expect(elRef).toBeDefined()
      expect(elRef.current).toBe(drag)
    })

    it('passes the interactive state to usePointerBridge', () => {
      renderDrag({
        interactive: false
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: true
        })
      )
    })

    it('calls onSwipeCommit for a swipeCommit reaction', () => {
      const onSwipeCommit = vi.fn()

      renderDrag({
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

      renderDrag({
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
      renderDrag()

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'swipeCommit' as EventType
      })

      expect(() => {
        onReaction?.(reaction)
      }).not.toThrow()
    })
  })

  describe('mirror', () => {
    it('does not render a mirror when dragging is false', () => {
      const slot = document.createElement('div')
      slot.id = 'drag-slot'
      document.body.appendChild(slot)

      const { container } = renderDrag()

      expect(slot.children).toHaveLength(0)

      container.remove()
      slot.remove()
    })

    it('renders a mirror when dragging is true', () => {
      const slot = document.createElement('div')
      slot.id = 'drag-slot'
      document.body.appendChild(slot)

      mockDragStore({
        dragging: true,
        liveOffset: {
          x: 10,
          y: 20
        },
        layout: {
          containerSize: {
            width: 100,
            height: 50
          },
          itemSize: {
            width: 50,
            height: 50
          }
        },
        frameRect: {
          top: 25,
          left: 0
        }
      })

      const { container } = renderDrag()

      expect(slot.children).toHaveLength(1)

      const mirrorContainer =
        slot.firstElementChild as HTMLElement

      expect(mirrorContainer).toHaveAttribute(
        'data-frame',
        'drag'
      )

      expect(mirrorContainer).toHaveStyle({
        width: '100px',
        height: '50px',
        top: '25px'
      })

      container.remove()
      slot.remove()
    })
  })
})