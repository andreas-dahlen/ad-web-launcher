import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'


import { scroll_DEFAULTS, useScrollStore } from '@primitives/Scroll/store/useScrollStore.hook.ts'
import { scrollStore } from '@primitives/Scroll/store/scroll.store.ts'

import {
  debugRegisterBinding,
  debugUnregisterBinding
} from '@test/functions.debug.ts'

vi.mock('@test/functions.debug', () => ({
  debugRegisterBinding: vi.fn(),
  debugUnregisterBinding: vi.fn()
}))

describe('[USE SCROLL STORE]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    scrollStore.setState({
      bindings: {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()

    scrollStore.setState({
      bindings: {}
    })
  })

  describe('lifecycle', () => {
    it('initializes the binding on mount', () => {
      renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      expect(scrollStore.getState().bindings).toHaveProperty(
        'test-scroll'
      )
    })

    it('initializes with visible defaults when initially visible', () => {
      renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      expect(
        scrollStore.getState().bindings['test-scroll']
      ).toEqual(scroll_DEFAULTS)
    })

    it('initializes with offscreen defaults when initially hidden', () => {
      renderHook(() =>
        useScrollStore('test-scroll', false)
      )

      expect(
        scrollStore.getState().bindings['test-scroll']
      ).toEqual({
        ...scroll_DEFAULTS,
        overflowValue: 800,
        isVisible: false
      })
    })

    it('deletes the binding on unmount', () => {
      const { unmount } = renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      expect(scrollStore.getState().bindings)
        .toHaveProperty('test-scroll')

      unmount()

      expect(scrollStore.getState().bindings)
        .not.toHaveProperty('test-scroll')
    })

    it('registers the binding for debugging on mount', () => {
      renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'test-scroll',
        'useScrollStore'
      )
    })

    it('unregisters the binding for debugging on unmount', () => {
      const { unmount } = renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      unmount()

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'test-scroll',
        'useScrollStore'
      )
    })
  })

  describe('binding', () => {
    it('returns the binding for the supplied id', () => {
      const binding = {
        ...scroll_DEFAULTS,
        liveValue: 120,
        settledValue: 100,
        velocity: 20,
        dragging: true
      }

      scrollStore.setState({
        bindings: {
          'test-scroll': binding
        }
      })

      const { result } = renderHook(() =>
        useScrollStore('test-scroll', true)
      )

      expect(result.current).toEqual(binding)
    })

    it('returns visible defaults when the binding does not exist and is initially visible', () => {
      const { result } = renderHook(() =>
        useScrollStore('missing-scroll', true)
      )

      expect(result.current).toEqual(scroll_DEFAULTS)
    })

    it('returns offscreen defaults when the binding does not exist and is initially hidden', () => {
      const { result } = renderHook(() =>
        useScrollStore('missing-scroll', false)
      )

      expect(result.current).toEqual({
        ...scroll_DEFAULTS,
        overflowValue: 800,
        isVisible: false
      })
    })
  })

  describe('id changes', () => {
    it('moves the binding lifecycle to the new id', () => {
      const { rerender } = renderHook(
        ({ id }) => useScrollStore(id, true),
        {
          initialProps: {
            id: 'first-scroll'
          }
        }
      )

      expect(scrollStore.getState().bindings)
        .toHaveProperty('first-scroll')

      rerender({
        id: 'second-scroll'
      })

      expect(scrollStore.getState().bindings)
        .not.toHaveProperty('first-scroll')

      expect(scrollStore.getState().bindings)
        .toHaveProperty('second-scroll')
    })

    it('registers the new id and unregisters the old id', () => {
      const { rerender } = renderHook(
        ({ id }) => useScrollStore(id, true),
        {
          initialProps: {
            id: 'first-scroll'
          }
        }
      )

      rerender({
        id: 'second-scroll'
      })

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'second-scroll',
        'useScrollStore'
      )

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'first-scroll',
        'useScrollStore'
      )
    })
  })

  describe('initial visibility', () => {
    it('uses visible defaults as the fallback when initially visible', () => {
      const { result } = renderHook(() =>
        useScrollStore('missing-scroll', true)
      )

      expect(result.current.isVisible).toBe(true)
      expect(result.current.overflowValue).toBe(0)
    })

    it('uses offscreen defaults as the fallback when initially hidden', () => {
      const { result } = renderHook(() =>
        useScrollStore('missing-scroll', false)
      )

      expect(result.current.isVisible).toBe(false)
      expect(result.current.overflowValue).toBe(800)
    })
  })
})