import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'


import { drag_DEFAULTS, useDragStore } from '@primitives/Drag/store/useDragStore.hook.ts'

import {
  debugRegisterBinding,
  debugUnregisterBinding
} from '@test/functions.debug.ts'
import { dragStore } from '@primitives/Drag/store/drag.store.ts'

vi.mock('@test/functions.debug', () => ({
  debugRegisterBinding: vi.fn(),
  debugUnregisterBinding: vi.fn()
}))

describe('[USE DRAG STORE]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    dragStore.setState({
      bindings: {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()

    dragStore.setState({
      bindings: {}
    })
  })

  describe('lifecycle', () => {
    it('initializes the binding on mount', () => {
      renderHook(() => useDragStore('test-drag'))

      expect(dragStore.getState().bindings).toHaveProperty(
        'test-drag'
      )
    })

    it('initializes the binding with drag defaults', () => {
      renderHook(() => useDragStore('test-drag'))

      expect(dragStore.getState().bindings['test-drag'])
        .toEqual(drag_DEFAULTS)
    })

    it('deletes the binding on unmount', () => {
      const { unmount } = renderHook(() =>
        useDragStore('test-drag')
      )

      expect(dragStore.getState().bindings)
        .toHaveProperty('test-drag')

      unmount()

      expect(dragStore.getState().bindings)
        .not.toHaveProperty('test-drag')
    })

    it('registers the binding for debugging on mount', () => {
      renderHook(() => useDragStore('test-drag'))

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'test-drag',
        'useDragStore'
      )
    })

    it('unregisters the binding for debugging on unmount', () => {
      const { unmount } = renderHook(() =>
        useDragStore('test-drag')
      )

      unmount()

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'test-drag',
        'useDragStore'
      )
    })
  })

  describe('binding', () => {
    it('returns the binding for the supplied id', () => {
      const binding = {
        ...drag_DEFAULTS,
        dragging: true,
        liveOffset: {
          x: 20,
          y: 30
        }
      }

      dragStore.setState({
        bindings: {
          'test-drag': binding
        }
      })

      const { result } = renderHook(() =>
        useDragStore('test-drag')
      )

      expect(result.current).toEqual(binding)
    })

    it('returns drag defaults when the binding does not exist', () => {
      const { result } = renderHook(() =>
        useDragStore('missing-drag')
      )

      expect(result.current).toEqual(drag_DEFAULTS)
    })
  })

  describe('id changes', () => {
    it('moves the binding lifecycle to the new id', () => {
      const { rerender } = renderHook(
        ({ id }) => useDragStore(id),
        {
          initialProps: {
            id: 'first-drag'
          }
        }
      )

      expect(dragStore.getState().bindings)
        .toHaveProperty('first-drag')

      rerender({
        id: 'second-drag'
      })

      expect(dragStore.getState().bindings)
        .not.toHaveProperty('first-drag')

      expect(dragStore.getState().bindings)
        .toHaveProperty('second-drag')
    })

    it('registers the new id and unregisters the old id', () => {
      const { rerender } = renderHook(
        ({ id }) => useDragStore(id),
        {
          initialProps: {
            id: 'first-drag'
          }
        }
      )

      rerender({
        id: 'second-drag'
      })

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'second-drag',
        'useDragStore'
      )

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'first-drag',
        'useDragStore'
      )
    })
  })
})