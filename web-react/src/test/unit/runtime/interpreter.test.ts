import { domQuery } from '@interaction/input/domQuery'
import { gestureUtils } from '@interaction/input/gesture.utils'
import { resetGesturesForTests, interpreter, returnGesturesForTests } from '@interaction/input/interpreter'
import type { Descriptor, SwipeableDescriptor } from '@interaction/types/descriptor/descriptor.types'
import type { RuntimeStart } from '@interaction/types/runtime/runtime.types'
import { createCarouselDesc, createDragDesc, createScrollDesc } from '@test/builders/desc.factory'
import { createInterpreterPress, createInterpreterSwipeStart, seedGesture } from '@test/builders/input.factory'
import { createRuntimeswipeStart } from '@test/builders/runtime.factory'
import { computed_DEFAULT } from '@test/fixtures/computed.fixture'
import type { EventBridgeType } from '../../../shared/types/core.types'
import { testPipeline } from '@test/testAPI'
import { afterEach, describe, expect, it, vi } from 'vitest'

const x = 0
const y = 0
const pointerId = 1

function setupDown(desc = createCarouselDesc() as Descriptor) {
  const spy = vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(desc)
  const result = interpreter.onDown(x, y, pointerId)
  return { result, spy }
}


function setupMove(xInput = x, yInput = y) {
  const swipeResult = interpreter.onMove(xInput, yInput, pointerId)
  return { swipeResult }
}



function setupMoveWithMock(desc = createCarouselDesc() as SwipeableDescriptor, xInput = x, yInput = y) {
  const swipeSpy = vi.spyOn(domQuery, 'findLaneInDom').mockReturnValue(desc)
  const swipeResult = interpreter.onMove(xInput, yInput, pointerId)
  return { swipeResult, swipeSpy }
}


afterEach(() => {
  vi.restoreAllMocks()
  resetGesturesForTests()
})

describe("[INTERPRETER]", () => {

  describe("[null Guards]", () => {
    it.each([
      ["down"],
      ["move"],
      ["up"],
    ])(
      "%s -> returned null",
      (eventType) => {
        const spy = eventType === "down"
          ? vi.spyOn(domQuery, 'findTargetInDom')
          : vi.spyOn(domQuery, 'findLaneInDom')

        spy.mockReturnValue(null)
        const interpreterFn = testPipeline.interpreterMap[eventType as EventBridgeType]

        const result = interpreterFn(x, y, pointerId)

        expect(result).toBe(null)
      }
    )
  })

  describe("[Gesture State]", () => {

    it("should initite state on down", () => {
      setupDown()
      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toMatchObject({
        phase: "PENDING",
        pointerId,
        state: {
          start: { x: 0, y: 0 },
          last: { x: 0, y: 0 },
          totalDelta: { x: 0, y: 0 }
        }
      })
    })

    it("should correctly mutate state on move", () => {
      setupDown()
      setupMove(99, y)
      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toMatchObject({
        phase: "SWIPING",
        pointerId,
        state: {
          start: { x: 0, y: 0 },
          last: { x: 103.125, y: 0 },
          totalDelta: { x: 0, y: 0 }
        }
      })
    })
    it("should correctly mutate state on move after already have moved", () => {
      setupDown()
      setupMove(99, y)
      setupMove(120, y)
      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toMatchObject({
        phase: "SWIPING",
        pointerId,
        state: {
          start: { x: 0, y: 0 },
          last: { x: 125, y: 0 },
          totalDelta: { x: 21.875, y: 0 }
        }
      })
    })
    it("should be undefined onUp", () => {
      setupDown()
      setupMove(99, y)
      setupMove(120, y)
      interpreter.onUp(5, 5, 1)
      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toBe(undefined)
    })
  })

  describe("[On Down]", () => {

    it("ensures a gesture state is initiated", () => {

      const gesturesBefore = returnGesturesForTests()
      expect(gesturesBefore).toStrictEqual({})

      setupDown()

      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toBeDefined()
    })

    it("ensures correct output", () => {
      const mock = createInterpreterPress("carousel")
      const { result } = setupDown(mock.desc)
      expect(result).toStrictEqual(mock)
    })
  })

  describe("[On Move]", () => {
    it('remains in PENDING phase while threshold is not exceeded', () => {

      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(false)

      setupDown()
      const { swipeResult } = setupMove()
      expect(swipeResult).toBe(null)

      const current = returnGesturesForTests()[pointerId]
      expect(current?.phase).toBe("PENDING")
    })

    it('returns expected package for swipeStart with original descriptor (NO PRESS CANCEL)', () => {
      const expected = createInterpreterSwipeStart("carousel")
      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)

      setupDown()
      const { swipeResult, swipeSpy } = setupMoveWithMock(expected.desc, 100, y)

      expect(swipeSpy).not.toHaveBeenCalled()

      expect(swipeResult?.runtime.event).toBe("swipeStart")
      expect(swipeResult?.runtime).toMatchObject({
        event: expected.runtime.event,
        delta: expected.runtime.delta
      })

      expect(swipeResult?.desc).toStrictEqual(expected.desc)
      expect(swipeResult?.computed).toStrictEqual(expected.computed)

      const runtime = swipeResult?.runtime as RuntimeStart
      expect(runtime.cancel).toBeUndefined()
    })
    it('returns expected package for swipeStart with NEW descriptor (WITH PRESS CANCEL)', () => {
      const expected = createInterpreterSwipeStart("drag", { runtime: createRuntimeswipeStart({ delta: { x: x, y: y } }) })
      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)

      setupDown()
      const { swipeResult, swipeSpy } = setupMoveWithMock(expected.desc)

      expect(swipeResult?.runtime.event).toBe("swipeStart")
      expect(swipeResult?.runtime).toMatchObject({
        event: expected.runtime.event,
        delta: expected.runtime.delta
      })

      expect(swipeSpy).toHaveBeenCalled()
      expect(swipeResult?.desc).toStrictEqual(expected.desc)
      expect(swipeResult?.computed).toStrictEqual(expected.computed)

      const runtime = swipeResult?.runtime as RuntimeStart
      expect(runtime.cancel).toBeDefined()
    })
    it('returns expected package for swipeStart with NEW descriptor (NO PRESS CANCEL)', () => {
      const oldDesc = createScrollDesc({ capabilities: { pressable: false, swipeable: false, instantSwipe: false } })
      const expected = {
        desc: createScrollDesc(),
        runtime: createRuntimeswipeStart({ delta: { x: x, y: y }, cancel: undefined })
      }

      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)

      setupDown(oldDesc)
      const { swipeSpy, swipeResult } = setupMoveWithMock(expected.desc)

      expect(swipeResult?.runtime.event).toBe("swipeStart")
      expect(swipeResult?.runtime).toMatchObject({
        event: expected.runtime.event,
        delta: expected.runtime.delta
      })

      expect(swipeSpy).toHaveBeenCalled()
      expect(swipeResult?.desc).toStrictEqual(expected.desc)

      const runtime = swipeResult?.runtime as RuntimeStart
      expect(runtime.cancel).not.toBeDefined()
    })
  })

  describe("[Transition]", () => {
    it("swipeStart uses original descriptor and skips lane resolution when threshold exceeded", () => {
      const desc = createCarouselDesc()

      const utilsSpy = vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      setupDown(desc)

      const { swipeResult, swipeSpy } = setupMoveWithMock(desc, 10, y)

      const g = returnGesturesForTests()
      const current = g[pointerId]
      expect(utilsSpy).toHaveBeenCalled()
      expect(swipeSpy).not.toHaveBeenCalled()
      expect(current?.phase).toBe("SWIPING")
      expect(current?.gesture.desc).toStrictEqual(desc)
      expect(swipeResult?.desc).toStrictEqual(desc)
    })

    it("swipeStart replaces descriptor with lane descriptor when threshold exceeded", () => {
      const dragDesc = createDragDesc()
      const utilsSpy = vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      setupDown()

      const { swipeResult, swipeSpy } = setupMoveWithMock(dragDesc)

      const g = returnGesturesForTests()
      const current = g[pointerId]
      expect(utilsSpy).toHaveBeenCalled()
      expect(swipeSpy).toHaveBeenCalled()
      expect(current?.phase).toBe("SWIPING")
      expect(current?.gesture.desc).toStrictEqual(dragDesc)
      expect(swipeResult?.desc).toStrictEqual(dragDesc)
    })
  })

  it("onMove correctly routes SwipeMove when phase is SWIPING and adds computed", () => {
    vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)

    const computedOne = computed_DEFAULT.slider
    const computedTwo = computed_DEFAULT.scroll

    setupDown()

    setupMove(100, y)

    const gestures = returnGesturesForTests()
    expect(gestures[pointerId]?.phase).toBe("SWIPING")

    interpreter.applyComputedUpdate(computedOne)
    const { swipeResult } = setupMove(268, 12)

    expect(swipeResult?.computed).toStrictEqual(computedOne)
    expect(swipeResult?.runtime.event).toBe("swipe")
    expect(swipeResult?.runtime.delta).toEqual({
      x: 175,
      y: 12.5
    })

    interpreter.applyComputedUpdate(computedTwo)
    const { swipeResult: resultTwo } = setupMove(268, 12)
    expect(resultTwo?.computed).toStrictEqual(computedTwo)
  })

  describe("[On Up]", () => {
    it("correctly returns swipeCommit with computed update", () => {
      const desc = createCarouselDesc()
      seedGesture("SWIPING")
      const result = interpreter.onUp(x, y, pointerId)
      expect(result?.runtime.event).toStrictEqual("swipeCommit")
      expect(result?.desc).toStrictEqual(desc)
      expect(result?.computed).toBeDefined()
    })
    it("correctly returns pressRelease", () => {
      const desc = createCarouselDesc()
      seedGesture("PENDING")
      const result = interpreter.onUp(x, y, pointerId)
      expect(result?.runtime.event).toStrictEqual("pressRelease")
      expect(result?.desc).toStrictEqual(desc)
    })

    it("correctly deletes gesture for pressRelease", () => {
      seedGesture("PENDING")
      interpreter.onUp(x, y, pointerId)
      const gestures = returnGesturesForTests()

      expect(gestures[pointerId]).toBe(undefined)
    })
    it("correctly deletes gesture for swipeCommit", () => {
      seedGesture("SWIPING")
      interpreter.onUp(x, y, pointerId)
      const gestures = returnGesturesForTests()

      expect(gestures[pointerId]).toBe(undefined)
    })
  })
})