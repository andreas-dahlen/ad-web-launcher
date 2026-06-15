import { interpreter } from '../input/interpreter.ts'
import { domUpdater } from '../updater/domUpdater.ts'
import { dragStore } from '@primitives/drag/store/drag.store.ts'
import { sliderStore } from '@primitives/slider/store/slider.store.ts'
import { carouselStore } from '@primitives/carousel/store/carousel.store.ts'
import type { EventBridgeType, EventType, InteractionType } from '../../shared/typing/core.types.ts'
import type { PointerEventPackage } from '@hooks/usePointerBridge.hook.ts'
import { gestureStore } from '../../shared/stores/gesture.store.ts'
import { scrollStore } from '@primitives/scroll/store/scroll.store.ts'
import { router } from '@interaction/runtime/solverRouter.ts'
import type { InterpreterOutput } from '@interaction/types/interpreter.types.ts'

/* =====================
        Maping
======================= */
type InterpreterFn = (x: number, y: number, pointerId: number) => InterpreterOutput | null

const interpreterMap: Record<EventBridgeType, InterpreterFn> = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

export const pipeline = {
  orchestrate,
  abortGesture
}
/* -------------------------
   Abort!
-------------------------- */
function abortGesture(pointerId: number) {
  //FUTURE for safty could possibly think about how to setup a abort for zustand stores to abort and reset store values.
  interpreter.deleteGesture(pointerId)
  gestureStore.getState().decrement(pointerId) // ← or reset to 0 if you're feeling paranoid
}

function notifyGestureStore(type: InteractionType, event: EventType, pointerId: number) {
  if (event === 'swipeStart') gestureStore.getState().increment(type, pointerId)

  if (event === 'swipeCommit') gestureStore.getState().decrement(pointerId)
}

function orchestrate(eventPackage: PointerEventPackage) {

  /* -------------------------
     Interpreter
  -------------------------- */

  const { eventType, x, y, pointerId } = eventPackage
  const interpreterFn = interpreterMap[eventType]

  if (!interpreterFn) {
    throw new Error(`Unknown eventType for interpreter: ${eventType}`)
  }

  const g = interpreterFn(x, y, pointerId)
  if (!g) return null

  /* -------------------------
     Solvers and Store Mutations narrowed
  -------------------------- */
  const { desc, runtime } = g
  const type = desc.type


  switch (type) {
    case 'carousel': {
      const solution = router.carousel(runtime, desc)
      if (solution) {
        if (solution.effects?.eventOverride) g.runtime.event = solution.effects.eventOverride
        carouselStore.getState().apply(desc.base.id, solution.action)
      }
      break
    }
    case 'slider': {
      const solution = router.slider(runtime, desc, g.computed)
      if (solution) {
        if (solution.effects?.computedUpdate) interpreter.applyComputedUpdate(solution.effects.computedUpdate)
        sliderStore.getState().apply(desc.base.id, solution.action)
      }
      break
    }
    case 'drag': {
      const solution = router.drag(runtime, desc)
      if (solution) {
        dragStore.getState().apply(desc.base.id, solution.action)
      }
      break
    }
    case 'scroll': {
      const solution = router.scroll(runtime, desc, g.computed)
      if (solution) {
        if (solution.effects?.computedUpdate) {
          interpreter.applyComputedUpdate(solution.effects.computedUpdate)
        }
        if (solution.effects?.eventOverride) g.runtime.event = solution.effects.eventOverride


        scrollStore.getState().apply(desc.base.id, solution.action)
      }
      break
    }
    case 'button': {
      break
    }
    default: {
      const { type } = desc
      throw new Error(`Unknown descriptor type for solver calls: ${type}`)
    }
  }
  /* -------------------------
     Renderer
  -------------------------- */
  domUpdater.handle(g.runtime, desc.base.element)

  /* -------------------------
     Global gesture storage for tsx subscription side effects
  -------------------------- */
  notifyGestureStore(desc.type, g.runtime.event, desc.base.pointerId)
}

export const __TEST_ONLY_API = {
  interpreterMap,
  notifyGestureStore
}