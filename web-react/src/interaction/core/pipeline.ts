import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { domUpdater } from '../updater/domUpdater.ts'
import { dragStore } from '../stores/dragStore.ts'
import { sliderStore } from '../stores/sliderStore.ts'
import { carouselStore } from '../stores/carouselStore.ts'
import { CAROUSEL_EVENTS, DRAG_EVENTS, SLIDER_EVENTS, type CarouselFunctions, type DragFunctions, type InterpreterFn, type SliderFunctions } from '../types/pipelineType.ts'
import type { EventBridgeType } from '../types/primitiveType.ts'
import type { CtxType } from '../types/ctxType.ts'
import type { PointerEventPackage } from '@components/hooks/pointerBridge.ts'

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
    //FUTURE for safty could possibly think about how to setup a abort for zustand stores to abort and reset store values.
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
        if (ctx.storeAccepted && CAROUSEL_EVENTS.has(ctx.event)) {
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
        if (ctx.storeAccepted && SLIDER_EVENTS.has(ctx.event)) {
          const fn = sliderStore.getState()[ctx.event as keyof SliderFunctions]
          fn?.(ctx)
        }
        break
      }
      case 'drag': {
        ctx = desc.ctx
        const sr = dragSolver?.[event]?.(desc)
        if (sr) ctx = { ...ctx, ...sr }
        if (ctx.storeAccepted && DRAG_EVENTS.has(ctx.event)) {
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
  }
}
