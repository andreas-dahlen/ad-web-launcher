import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'



import { carousel_DEFAULTS, useCarouselStore } from '@primitives/Carousel/store/useCarouselStore.hook.ts'

import {
  debugRegisterBinding,
  debugUnregisterBinding
} from '@test/functions.debug.ts'
import { carouselStore } from '@primitives/Carousel/store/carousel.store.ts'

vi.mock('@test/functions.debug', () => ({
  debugRegisterBinding: vi.fn(),
  debugUnregisterBinding: vi.fn()
}))

describe('[USE CAROUSEL STORE]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    carouselStore.setState({
      bindings: {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()

    carouselStore.setState({
      bindings: {}
    })
  })

  describe('lifecycle', () => {
    it('initializes the binding on mount', () => {
      renderHook(() => useCarouselStore('test-carousel'))

      expect(carouselStore.getState().bindings).toHaveProperty(
        'test-carousel'
      )
    })

    it('initializes the binding with carousel defaults', () => {
      renderHook(() => useCarouselStore('test-carousel'))

      expect(
        carouselStore.getState().bindings['test-carousel']
      ).toEqual(carousel_DEFAULTS)
    })

    it('initializes with the carousel node bindings', () => {
      renderHook(() => useCarouselStore('test-carousel'))

      expect(
        carouselStore.getState().bindings['test-carousel']?.nodeBindings
      ).toEqual(carousel_DEFAULTS.nodeBindings)
    })

    it('deletes the binding on unmount', () => {
      const { unmount } = renderHook(() =>
        useCarouselStore('test-carousel')
      )

      expect(carouselStore.getState().bindings)
        .toHaveProperty('test-carousel')

      unmount()

      expect(carouselStore.getState().bindings)
        .not.toHaveProperty('test-carousel')
    })

    it('registers the binding for debugging on mount', () => {
      renderHook(() => useCarouselStore('test-carousel'))

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'test-carousel',
        'useCarouselStore'
      )
    })

    it('unregisters the binding for debugging on unmount', () => {
      const { unmount } = renderHook(() =>
        useCarouselStore('test-carousel')
      )

      unmount()

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'test-carousel',
        'useCarouselStore'
      )
    })
  })

  describe('binding', () => {
    it('returns the binding for the supplied id', () => {
      const binding = {
        ...carousel_DEFAULTS,
        count: 5,
        liveOffset: 100,
        dragging: true
      }

      carouselStore.setState({
        bindings: {
          'test-carousel': binding
        }
      })

      const { result } = renderHook(() =>
        useCarouselStore('test-carousel')
      )

      expect(result.current).toEqual(binding)
    })

    it('returns carousel defaults when the binding does not exist', () => {
      const { result } = renderHook(() =>
        useCarouselStore('missing-carousel')
      )

      expect(result.current).toEqual(carousel_DEFAULTS)
    })
  })

  describe('id changes', () => {
    it('moves the binding lifecycle to the new id', () => {
      const { rerender } = renderHook(
        ({ id }) => useCarouselStore(id),
        {
          initialProps: {
            id: 'first-carousel'
          }
        }
      )

      expect(carouselStore.getState().bindings)
        .toHaveProperty('first-carousel')

      rerender({
        id: 'second-carousel'
      })

      expect(carouselStore.getState().bindings)
        .not.toHaveProperty('first-carousel')

      expect(carouselStore.getState().bindings)
        .toHaveProperty('second-carousel')
    })

    it('registers the new id and unregisters the old id', () => {
      const { rerender } = renderHook(
        ({ id }) => useCarouselStore(id),
        {
          initialProps: {
            id: 'first-carousel'
          }
        }
      )

      rerender({
        id: 'second-carousel'
      })

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'second-carousel',
        'useCarouselStore'
      )

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'first-carousel',
        'useCarouselStore'
      )
    })
  })
})