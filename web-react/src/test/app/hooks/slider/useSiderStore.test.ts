import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sliderStore } from '@primitives/Slider/store/slider.store.ts'

import { useSliderStore, slider_DEFAULTS } from '@primitives/Slider/store/useSliderStore.hook.ts'

import {
  debugRegisterBinding,
  debugUnregisterBinding
} from '@test/functions.debug.ts'

vi.mock('@test/functions.debug', () => ({
  debugRegisterBinding: vi.fn(),
  debugUnregisterBinding: vi.fn()
}))

describe('[USE SLIDER STORE]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    sliderStore.setState({
      bindings: {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()

    sliderStore.setState({
      bindings: {}
    })
  })

  describe('lifecycle', () => {
    it('initializes the binding on mount', () => {
      renderHook(() => useSliderStore('test-slider'))

      expect(sliderStore.getState().bindings).toHaveProperty(
        'test-slider'
      )
    })

    it('initializes the binding with slider defaults', () => {
      renderHook(() => useSliderStore('test-slider'))

      expect(
        sliderStore.getState().bindings['test-slider']
      ).toEqual(slider_DEFAULTS)
    })

    it('deletes the binding on unmount', () => {
      const { unmount } = renderHook(() =>
        useSliderStore('test-slider')
      )

      expect(sliderStore.getState().bindings)
        .toHaveProperty('test-slider')

      unmount()

      expect(sliderStore.getState().bindings)
        .not.toHaveProperty('test-slider')
    })

    it('registers the binding for debugging on mount', () => {
      renderHook(() => useSliderStore('test-slider'))

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'test-slider',
        'useSliderStore'
      )
    })

    it('unregisters the binding for debugging on unmount', () => {
      const { unmount } = renderHook(() =>
        useSliderStore('test-slider')
      )

      unmount()

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'test-slider',
        'useSliderStore'
      )
    })
  })

  describe('binding', () => {
    it('returns the binding for the supplied id', () => {
      const binding = {
        ...slider_DEFAULTS,
        value: 50,
        constraints: {
          min: 10,
          max: 90
        },
        dragging: true
      }

      sliderStore.setState({
        bindings: {
          'test-slider': binding
        }
      })

      const { result } = renderHook(() =>
        useSliderStore('test-slider')
      )

      expect(result.current).toEqual(binding)
    })

    it('returns slider defaults when the binding does not exist', () => {
      const { result } = renderHook(() =>
        useSliderStore('missing-slider')
      )

      expect(result.current).toEqual(slider_DEFAULTS)
    })
  })

  describe('id changes', () => {
    it('moves the binding lifecycle to the new id', () => {
      const { rerender } = renderHook(
        ({ id }) => useSliderStore(id),
        {
          initialProps: {
            id: 'first-slider'
          }
        }
      )

      expect(sliderStore.getState().bindings)
        .toHaveProperty('first-slider')

      rerender({
        id: 'second-slider'
      })

      expect(sliderStore.getState().bindings)
        .not.toHaveProperty('first-slider')

      expect(sliderStore.getState().bindings)
        .toHaveProperty('second-slider')
    })

    it('registers the new id and unregisters the old id', () => {
      const { rerender } = renderHook(
        ({ id }) => useSliderStore(id),
        {
          initialProps: {
            id: 'first-slider'
          }
        }
      )

      rerender({
        id: 'second-slider'
      })

      expect(debugRegisterBinding).toHaveBeenCalledWith(
        'second-slider',
        'useSliderStore'
      )

      expect(debugUnregisterBinding).toHaveBeenCalledWith(
        'first-slider',
        'useSliderStore'
      )
    })
  })
})