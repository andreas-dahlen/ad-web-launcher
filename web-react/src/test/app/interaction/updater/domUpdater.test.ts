import { describe, expect, it, vi } from 'vitest'

import { domUpdater } from '@interaction/updater/domUpdater'

import { createRuntimePress, createRuntimeSwipe, createRuntimeswipeStart, createRuntimeSwipeCommit } from '@test/app/interaction/builders/runtime.factory'

import type { Runtime } from '@interaction/types/runtime/runtime.types'

describe('[DOM UPDATER]', () => {
  const createElement = () => document.createElement('div')

  const getReaction = (element: HTMLElement) => {
    const handler = vi.fn()
    element.addEventListener('reaction', handler)
    return handler
  }

  describe('handle', () => {
    it.each([
      ['press', 'pressed'],
      ['pressRelease', 'released'],
      ['pressCancel', 'canceled'],
      ['swipeStart', 'swiping'],
      ['swipeCommit', 'committed'],
      ['swipeRevert', 'reverted']
    ] as const)(
      'sets data-state="%s" for %s',
      (event, expectedState) => {
        const element = createElement()
        const runtime = {
          ...createRuntimePress(),
          event
        } as Runtime

        domUpdater.handle(runtime, element)

        expect(element.dataset.state).toBe(expectedState)
      }
    )

    it('does not set data-state for swipe', () => {
      const element = createElement()
      const runtime = createRuntimeSwipe()

      domUpdater.handle(runtime, element)

      expect(element.dataset.state).toBeUndefined()
    })

    it('dispatches a reaction event with the runtime event', () => {
      const element = createElement()
      const reaction = getReaction(element)
      const runtime = createRuntimePress()

      domUpdater.handle(runtime, element)

      expect(reaction).toHaveBeenCalledTimes(1)
      expect(reaction.mock.calls[0][0]).toBeInstanceOf(CustomEvent)
      expect(
        (reaction.mock.calls[0][0] as CustomEvent).detail
      ).toBe('press')
    })

    it('dispatches only the primary reaction for normal events', () => {
      const element = createElement()
      const reaction = getReaction(element)
      const runtime = createRuntimeSwipeCommit()

      domUpdater.handle(runtime, element)

      expect(reaction).toHaveBeenCalledTimes(1)
      expect(
        (reaction.mock.calls[0][0] as CustomEvent).detail
      ).toBe('swipeCommit')
    })

    it('dispatches pressCancel on the cancel element during swipeStart', () => {
      const element = createElement()
      const cancelElement = createElement()

      const primaryReaction = getReaction(element)
      const cancelReaction = getReaction(cancelElement)

      const runtime = {
        ...createRuntimeswipeStart(),
        cancel: {
          pressCancel: true,
          element: cancelElement
        }
      } as Runtime

      domUpdater.handle(runtime, element)

      expect(primaryReaction).toHaveBeenCalledTimes(1)
      expect(
        (primaryReaction.mock.calls[0][0] as CustomEvent).detail
      ).toBe('swipeStart')

      expect(cancelReaction).toHaveBeenCalledTimes(1)
      expect(
        (cancelReaction.mock.calls[0][0] as CustomEvent).detail
      ).toBe('pressCancel')
    })

    it('does not dispatch pressCancel when it is not requested', () => {
      const element = createElement()
      const cancelElement = createElement()

      const primaryReaction = getReaction(element)
      const cancelReaction = getReaction(cancelElement)

      const runtime = {
        ...createRuntimeswipeStart(),
        cancel: {
          pressCancel: false,
          element: cancelElement
        }
      } as Runtime

      domUpdater.handle(runtime, element)

      expect(primaryReaction).toHaveBeenCalledTimes(1)
      expect(cancelReaction).not.toHaveBeenCalled()
    })

    it('does not dispatch pressCancel when cancel data is missing', () => {
      const element = createElement()
      const reaction = getReaction(element)

      const runtime = createRuntimeswipeStart()

      domUpdater.handle(runtime, element)

      expect(reaction).toHaveBeenCalledTimes(1)
      expect(
        (reaction.mock.calls[0][0] as CustomEvent).detail
      ).toBe('swipeStart')
    })

    it('does not dispatch pressCancel for non-swipeStart events', () => {
      const element = createElement()
      const cancelElement = createElement()

      const primaryReaction = getReaction(element)
      const cancelReaction = getReaction(cancelElement)

      const runtime = {
        ...createRuntimePress(),
        cancel: {
          pressCancel: true,
          element: cancelElement
        }
      } as Runtime

      domUpdater.handle(runtime, element)

      expect(primaryReaction).toHaveBeenCalledTimes(1)
      expect(cancelReaction).not.toHaveBeenCalled()
    })

    it('does not throw when the element is missing', () => {
      const runtime = createRuntimePress()

      expect(() => {
        domUpdater.handle(runtime, null as never)
      }).not.toThrow()
    })
  })
})