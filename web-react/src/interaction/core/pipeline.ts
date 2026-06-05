import { interpreter, type GestureInput } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver/dragSolver.ts'
import { scrollSolver } from '@interaction/solvers/scrollSolver/scrollSolver.ts'
import { domUpdater } from '../updater/domUpdater.ts'
import { dragStore } from '@primitives/drag/store/dragStore.ts'
import { sliderStore } from '@primitives/slider/store/sliderStore.ts'
import { carouselStore } from '@primitives/carousel/store/carouselStore.ts'
import type { EventBridgeType, EventType, InteractionType } from '../../shared/typing/core.types.ts'
import type { PointerEventPackage } from '@hooks/usePointerBridge.ts'
import { gestureStore } from '../../shared/runtime/gestureStore.ts'
import { scrollStore } from '@primitives/scroll/store/scrollStore.ts'
/* =====================
        Maping
======================= */
export type InterpreterFn = (x: number, y: number, pointerId: number) => GestureInput | null

const interpreterMap: Record<EventBridgeType, InterpreterFn> = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

export const pipeline = {
  /* -------------------------
     Abort!
  -------------------------- */
  abortGesture(pointerId: number) {
    //FUTURE for safty could possibly think about how to setup a abort for zustand stores to abort and reset store values.
    interpreter.deleteGesture(pointerId)
    gestureStore.getState().decrement(pointerId) // ← or reset to 0 if you're feeling paranoid
  },

  notifyGestureStore(type: InteractionType, event: EventType, pointerId: number) {
    if (event === 'swipeStart') gestureStore.getState().increment(type, pointerId)

    if (event === 'swipeCommit') gestureStore.getState().decrement(pointerId)
  },

  orchestrate(eventPackage: PointerEventPackage) {

    /* -------------------------
       Interpreter
    -------------------------- */

    const { eventType, x, y, pointerId } = eventPackage
    const interpreterFn = interpreterMap[eventType]

    if (!interpreterFn) {
      console.warn('Unknown eventType', eventType)
      return null
    }

    const g = interpreterFn(x, y, pointerId)
    if (!g) return null

    /* -------------------------
       Solvers and Store Mutations narrowed
    -------------------------- */
    const { computed, desc } = g.gesture
    const { runtime } = g
    const event = runtime.event
    const type = desc.type

    switch (type) {
      case 'carousel': {
        const solution = carouselSolver?.[event]?.(runtime, desc, computed)
        if (solution?.storeAccepted) {
          if (solution?.event) g.runtime.event = solution.event
          //TODO future make runtime imutable input.. and solution is used for final event override by consumers... ?
          carouselStore.getState().apply(desc.base.id, runtime.event, solution)
        }
        break
      }
      case 'slider': {
        const solution = sliderSolver?.[event]?.(runtime, desc, computed)
        if (solution?.storeAccepted) {

          if (solution.computedUpdate != null) interpreter.applyComputedUpdate(solution.computedUpdate, desc.base.pointerId)
          sliderStore.getState().apply(desc.base.id, runtime.event, solution)
        }
        break
      }
      case 'drag': {
        const solution = dragSolver?.[event]?.(runtime, desc, computed)
        if (solution?.storeAccepted) {
          dragStore.getState().apply(desc.base.id, runtime.event, solution)
        }
        break
      }
      case 'scroll': {
        const solution = scrollSolver?.[event]?.(runtime, desc, computed)
        if (solution?.storeAccepted) {
          if (solution.computedUpdate != null) interpreter.applyComputedUpdate(solution.computedUpdate, desc.base.pointerId)
          if (solution?.event) g.runtime.event = solution.event


          scrollStore.getState().apply(desc.base.id, runtime.event, solution)
        }
        break
      }
      case 'button': {
        break
      }
      default: {
        const { type } = desc
        throw new Error(`Unknown descriptor type: ${type}`)
      }
    }
    //TODO stores missing ID!
    /* -------------------------
       Renderer
    -------------------------- */
    domUpdater.handle(g.runtime, desc.base.element)

    /* -------------------------
       Global gesture storage for tsx subscription side effects
    -------------------------- */
    this.notifyGestureStore(desc.type, g.runtime.event, desc.base.pointerId)
  }
}
