import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { domUpdater } from '../updater/domUpdater.ts'
import { dragStore } from '@interaction/stores/dragStore.ts'
import { sliderStore } from '@interaction/stores/sliderStore.ts'
import { carouselStore } from '@interaction/stores/carouselStore.ts'
import type { EventBridgeType } from '@interaction/types/primitiveType.ts'
import type { CarouselFunctions, DragFunctions, InterpreterFn, PointerEventPackage, SliderFunctions } from '@interaction/types/pipelineType.ts'
import type { CtxType } from '@interaction/types/ctxType.ts'

/* =====================
        Maping
======================= */

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
    //for safty could possibly think about how to setup a abort for zustand stores to abort and reset state values.
    interpreter.deleteGesture(pointerId)
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
          // if (ctx.gestureUpdate != null) interpreter.applyGestureUpdate(ctx.gestureUpdate)
          const fn = carouselStore.getState()[ctx.event as keyof CarouselFunctions]
          fn?.(ctx)
        }
        break
      }
      case 'slider': {
        ctx = desc.ctx
        const sr = sliderSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.gestureUpdate != null) interpreter.applyGestureUpdate(ctx.gestureUpdate)
        if (ctx.storeAccepted) {
          const fn = sliderStore.getState()[ctx.event as keyof SliderFunctions]
          fn?.(ctx)
        }
        break
      }

      case 'drag': {
        ctx = desc.ctx
        const sr = dragSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.storeAccepted) {
          // if (ctx.gestureUpdate != null) interpreter.applyGestureUpdate(ctx.gestureUpdate)
          const fn = dragStore.getState()[ctx.event as keyof DragFunctions]
          fn?.(ctx)
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

    return ctx
  }
}
