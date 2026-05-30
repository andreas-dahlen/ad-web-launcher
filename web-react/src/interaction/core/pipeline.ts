import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver/dragSolver.ts'
import { scrollSolver } from '@interaction/solvers/scrollSolver/scrollSolver.ts'
import { domUpdater } from '../updater/domUpdater.ts'
import { dragStore } from '@primitives/drag/store/dragStore.ts'
import { sliderStore } from '@primitives/slider/store/sliderStore.ts'
import { carouselStore } from '@primitives/carousel/store/carouselStore.ts'
import type { EventBridgeType } from '../../shared/typing/core.types.ts'
import type { CtxType } from '../types/ctx.types.ts'
import type { PointerEventPackage } from '@hooks/usePointerBridge.ts'
import { gestureStore } from '../../shared/runtime/gestureStore.ts'
import { scrollStore } from '@primitives/scroll/store/scrollStore.ts'
import type { Descriptor } from '@interaction/types/descriptor.types.ts'

/* =====================
        Maping
======================= */
export type InterpreterFn = (x: number, y: number, pointerId: number) => Descriptor | null

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

  notifyGestureStore(ctx: CtxType, pointerId: number) {
    if (ctx.event === 'swipeStart') gestureStore.getState().increment(ctx, pointerId)

    if (ctx.event === 'swipeCommit' || ctx.event === 'swipeRevert') gestureStore.getState().decrement(pointerId)
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

    const desc = interpreterFn(x, y, pointerId)
    if (!desc) return null

    /* -------------------------
       Solvers and Store Mutations narrowed
    -------------------------- */
    const { type, ctx: { event } } = desc
    let ctx: CtxType

    switch (type) {
      case 'carousel': {
        ctx = desc.ctx
        const sr = carouselSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.storeAccepted) {
          carouselStore.getState().apply(ctx)
        }
        break
      }
      case 'slider': {
        ctx = desc.ctx
        const sr = sliderSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.gestureUpdate != null) interpreter.applyGestureUpdate(ctx.gestureUpdate)
        if (ctx.storeAccepted) {
          sliderStore.getState().apply(ctx)
        }
        break
      }
      case 'drag': {
        ctx = desc.ctx
        const sr = dragSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.storeAccepted) {
          dragStore.getState().apply(ctx)

          if (ctx.event === 'swipeStart') {
            dragStore.getState().setFrame(desc.base.id, desc.base.frame)
          }
        }
        break
      }
      case 'scroll': {
        ctx = desc.ctx
        const sr = scrollSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.gestureUpdate != null) interpreter.applyGestureUpdate(ctx.gestureUpdate)
        if (ctx.storeAccepted) {
          scrollStore.getState().apply(ctx)
        }
        break
      }
      case 'button': {
        ctx = desc.ctx
        break
      }
      default: { throw new Error(`Unknown descriptor type: ${type}`) }
    }

    /* -------------------------
       Renderer
    -------------------------- */
    domUpdater.handle(ctx)

    /* -------------------------
       Global gesture storage for tsx subscription side effects
    -------------------------- */
    this.notifyGestureStore(ctx, desc.base.pointerId)
  }
}
