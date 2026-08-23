import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook'
import { pipeline } from '@interaction/runtime/pipeline'

vi.mock('@interaction/runtime/pipeline', () => ({
  pipeline: {
    orchestrate: vi.fn(),
    abortGesture: vi.fn()
  }
}))

describe('[USE POINTER BRIDGE]', () => {
  let element: HTMLElement
  let elRef: { current: HTMLElement | null }

  let setPointerCapture: ReturnType<typeof vi.fn>
  let releasePointerCapture: ReturnType<typeof vi.fn>
  let hasPointerCapture: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    element = document.createElement('div')
    document.body.appendChild(element)

    elRef = {
      current: element
    }

    /*
    * jsdom does not implement Pointer Capture APIs.
    * Provide the minimal browser API required by the hook.
    */
    setPointerCapture = vi.fn()
    releasePointerCapture = vi.fn()
    hasPointerCapture = vi.fn(() => true)

    Object.defineProperties(HTMLElement.prototype, {
      setPointerCapture: {
        configurable: true,
        value: setPointerCapture
      },
      releasePointerCapture: {
        configurable: true,
        value: releasePointerCapture
      },
      hasPointerCapture: {
        configurable: true,
        value: hasPointerCapture
      }
    })
  })

  afterEach(() => {
    element.remove()

    delete (HTMLElement.prototype as Partial<HTMLElement>).setPointerCapture
    delete (HTMLElement.prototype as Partial<HTMLElement>).releasePointerCapture
    delete (HTMLElement.prototype as Partial<HTMLElement>).hasPointerCapture
  })

  function pointerEvent(
    type: string,
    pointerId = 1,
    x = 100,
    y = 200
  ): PointerEvent {
    return new PointerEvent(type, {
      pointerId,
      clientX: x,
      clientY: y,
      bubbles: true
    })
  }

  describe('pointerdown', () => {
    it('starts a gesture and forwards the down event', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7, 123, 456))

      expect(setPointerCapture).toHaveBeenCalledWith(7)

      expect(pipeline.orchestrate).toHaveBeenCalledWith({
        eventType: 'down',
        x: 123,
        y: 456,
        pointerId: 7
      })
    })

    it('ignores a second pointer while a gesture is active', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointerdown', 8))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(1)
      expect(setPointerCapture).toHaveBeenCalledTimes(1)
      expect(setPointerCapture).toHaveBeenCalledWith(7)
    })
  })

  describe('pointermove', () => {
    it('forwards moves for the active pointer', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7, 10, 20))
      element.dispatchEvent(pointerEvent('pointermove', 7, 30, 40))

      expect(pipeline.orchestrate).toHaveBeenLastCalledWith({
        eventType: 'move',
        x: 30,
        y: 40,
        pointerId: 7
      })
    })

    it('ignores moves from another pointer', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointermove', 8, 300, 400))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(1)
    })

    it('ignores moves when no gesture is active', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointermove', 7))

      expect(pipeline.orchestrate).not.toHaveBeenCalled()
    })
  })

  describe('pointerup', () => {
    it('forwards up and releases pointer capture', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointerup', 7, 150, 250))

      expect(hasPointerCapture).toHaveBeenCalledWith(7)
      expect(releasePointerCapture).toHaveBeenCalledWith(7)

      expect(pipeline.orchestrate).toHaveBeenLastCalledWith({
        eventType: 'up',
        x: 150,
        y: 250,
        pointerId: 7
      })
    })

    it('ends the gesture after pointerup', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointerup', 7))
      element.dispatchEvent(pointerEvent('pointermove', 7))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(2)
    })

    it('ignores pointerup from another pointer', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointerup', 8))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(1)
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })

    it('ignores pointerup when no gesture is active', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerup', 7))

      expect(pipeline.orchestrate).not.toHaveBeenCalled()
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })
  })

  describe('pointercancel', () => {
    it('aborts the active gesture and releases pointer capture', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointercancel', 7))

      expect(hasPointerCapture).toHaveBeenCalledWith(7)
      expect(releasePointerCapture).toHaveBeenCalledWith(7)
      expect(pipeline.abortGesture).toHaveBeenCalledWith(7)
    })

    it('ends the gesture after pointercancel', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointercancel', 7))
      element.dispatchEvent(pointerEvent('pointermove', 7))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(1)
    })

    it('ignores cancel from another pointer', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))
      element.dispatchEvent(pointerEvent('pointercancel', 8))

      expect(pipeline.abortGesture).not.toHaveBeenCalled()
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })

    it('ignores pointercancel when no gesture is active', () => {
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointercancel', 7))

      expect(pipeline.abortGesture).not.toHaveBeenCalled()
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })
  })

  describe('reaction events', () => {
    it('forwards CustomEvent reactions to onReaction', () => {
      const onReaction = vi.fn()

      renderHook(() =>
        usePointerBridge({
          elRef,
          onReaction
        })
      )

      const reaction = new CustomEvent('reaction', {
        detail: {
          type: 'swipe'
        }
      })

      element.dispatchEvent(reaction)

      expect(onReaction).toHaveBeenCalledTimes(1)
      expect(onReaction).toHaveBeenCalledWith(reaction)
    })

    it('ignores non-CustomEvent reaction events', () => {
      const onReaction = vi.fn()

      renderHook(() =>
        usePointerBridge({
          elRef,
          onReaction
        })
      )

      element.dispatchEvent(new Event('reaction'))

      expect(onReaction).not.toHaveBeenCalled()
    })

    it('uses the latest onReaction callback', () => {
      const firstReaction = vi.fn()
      const secondReaction = vi.fn()

      const { rerender } = renderHook(
        ({ onReaction }) =>
          usePointerBridge({
            elRef,
            onReaction
          }),
        {
          initialProps: {
            onReaction: firstReaction
          }
        }
      )

      rerender({
        onReaction: secondReaction
      })

      const reaction = new CustomEvent('reaction')

      element.dispatchEvent(reaction)

      expect(firstReaction).not.toHaveBeenCalled()
      expect(secondReaction).toHaveBeenCalledWith(reaction)
    })
  })

  describe('disabled', () => {
    it('does not register pointer handling when disabled', () => {
      renderHook(() =>
        usePointerBridge({
          elRef,
          disabled: true
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))

      expect(pipeline.orchestrate).not.toHaveBeenCalled()
    })

    it('aborts an active gesture when disabled', () => {
      const { rerender } = renderHook(
        ({ disabled }) =>
          usePointerBridge({
            elRef,
            disabled
          }),
        {
          initialProps: {
            disabled: false
          }
        }
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))

      rerender({
        disabled: true
      })

      expect(pipeline.abortGesture).toHaveBeenCalledWith(7)
      expect(releasePointerCapture).toHaveBeenCalledWith(7)

      element.dispatchEvent(pointerEvent('pointermove', 7))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(1)
    })

    it('does not abort when disabled without an active gesture', () => {
      const { rerender } = renderHook(
        ({ disabled }) =>
          usePointerBridge({
            elRef,
            disabled
          }),
        {
          initialProps: {
            disabled: false
          }
        }
      )

      rerender({
        disabled: true
      })

      expect(pipeline.abortGesture).not.toHaveBeenCalled()
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('removes pointer handling when unmounted', () => {
      const { unmount } = renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      unmount()

      element.dispatchEvent(pointerEvent('pointerdown', 7))

      expect(pipeline.orchestrate).not.toHaveBeenCalled()
    })

    it('aborts an active gesture when unmounted', () => {
      const { unmount } = renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))

      unmount()

      expect(pipeline.abortGesture).toHaveBeenCalledWith(7)
    })

    it('clears the active gesture during cleanup', () => {
      const { unmount } = renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 7))

      unmount()

      /*
      * Re-mounting against the same element should start a fresh gesture.
      */
      renderHook(() =>
        usePointerBridge({
          elRef
        })
      )

      element.dispatchEvent(pointerEvent('pointerdown', 8))

      expect(pipeline.orchestrate).toHaveBeenCalledTimes(2)
      expect(setPointerCapture).toHaveBeenLastCalledWith(8)
    })
  })
})