import { interpreter } from './interpreter.ts'
import { carouselSolver } from '../solvers/carouselSolver.ts'
import { sliderSolver } from '../solvers/sliderSolver.ts'
import { dragSolver } from '../solvers/dragSolver.ts'
import { render } from '../updater/renderer.ts'
import type { EventBridgeType } from '@interaction/types/primitiveType.ts'
import { dragStore } from '@interaction/zunstand/dragState.ts'
import { sliderStore } from '@interaction/zunstand/sliderState.ts'
import { carouselStore } from '@interaction/zunstand/carouselState.ts'
import type { CarouselFunctions, DragFunctions, InterpreterFn, PointerEventPackage, SliderFunctions, SolverMap } from '@interaction/types/pipelineType.ts'
import type { CtxType } from '@interaction/types/ctxType.ts'

/* =====================
        Maping
======================= */

const interpreterMap: Record<EventBridgeType, InterpreterFn> = {
  down: interpreter.onDown,
  move: interpreter.onMove,
  up: interpreter.onUp
}

const solverRegistry: SolverMap = {
  carousel: carouselSolver,
  slider: sliderSolver,
  drag: dragSolver
}

export const pipeline = {
  /* -------------------------
     Abort!
  -------------------------- */
  abortGesture(pointerId: number) {
    //for safty could possibly think about how to setup a abort for zustand stores to abort and reset state values.
    interpreter.deleteGesture(pointerId)
  },

  orchestrate(desc: PointerEventPackage) {

    /* -------------------------
       Interpreter
    -------------------------- */

    const { eventType, x, y, pointerId } = desc
    const interpreterFn = interpreterMap[eventType]

    if (!interpreterFn) {
      console.warn('Unknown eventType', eventType)
      return null
    }

    const baseDesc = interpreterFn(x, y, pointerId)
    if (!baseDesc) return null
    /* -------------------------
       Solvers
    -------------------------- */

    const { type, ctx: { event } } = baseDesc
    let ctx: CtxType
    if (type !== 'button') {
      ctx = baseDesc.ctx
      const solverFn = solverRegistry[type]?.[event]
      // const solverResult = solverFn?.(baseDesc)
      const sr = solverFn?.(baseDesc)
      if (sr) ctx = { ...ctx, ...sr }

      if (ctx.type === 'slider' && ctx.gestureUpdate != null) {
        interpreter.applyGestureUpdate(ctx.gestureUpdate)
      }
    } else {
      ctx = baseDesc.ctx
    }
    const { type: ctxType, event: modEvent } = ctx

    if (ctx.stateAccepted) {
      switch (ctxType) {
        case 'carousel': {
          const state = carouselStore.getState()
          const fn = state[modEvent as keyof CarouselFunctions]
          fn?.(ctx)
          break
        }
        case 'slider': {
          const state = sliderStore.getState()
          const fn = state[modEvent as keyof SliderFunctions]
          fn?.(ctx)
          break
        }
        case 'drag': {
          const state = dragStore.getState()
          const fn = state[modEvent as keyof DragFunctions]
          fn?.(ctx)
          break
        }
        case 'button': {
          break
        }
        default: { throw new Error(`Unknown descriptor type: ${type}`) }
      }
    }

    /* -------------------------
       Renderer
    -------------------------- */

    render.handle(ctx)

    return ctx
  }
}
