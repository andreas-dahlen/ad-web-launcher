import { state } from '../state/stateManager'

export const targetResolver = {
  resolveFromElement(el) {
  if (!el) return null

  const ctx = this.buildContext(el)
  if (!ctx) return null

  return {
    ...this.buildBase(ctx),
    ...this.buildSwipe(ctx),
    reactions: this.buildReactions(ctx.ds, ctx.laneValid)
  }
},

buildContext(el) {
  const ds = el.dataset || {}
  const laneId = ds.lane || null
  const axis = ds.axis || null
  const swipeType = ds.swipeType || null
  const laneValid = Boolean(laneId && axis && swipeType)
  return { el, ds, laneId, axis, swipeType, laneValid }
},

buildBase(ctx) {
  return {
    element: ctx.el,
    laneId: ctx.laneValid ? ctx.laneId : null,
    axis: ctx.laneValid ? ctx.axis : null,
    swipeType: ctx.laneValid ? ctx.swipeType : null,
    actionId: ctx.ds.action || null,
    startOffset: null
  }
},

buildSwipe(ctx) {
  if (!ctx.laneValid) return {}
  const { laneId, swipeType } = ctx

  return {
    //ALL
    laneSize: state.getSize(swipeType, laneId),//{x, y}
    // //SLIDER
    sliderPosition: swipeType === 'slider'
        ? state.getPosition(swipeType, laneId) : null, //{x, y}
    sliderConstraints: swipeType === 'slider'
        ? state.getConstraints(swipeType, laneId) : null,//{min, max}
    //DRAG
    dragPosition: swipeType === 'drag'
        ? state.getPosition(swipeType, laneId) : null,//{x, y}
    dragConstraints: swipeType === 'drag'
        ? state.getConstraints(swipeType, laneId) : null//{minX, maxX, minY, maxY}
  }
},
  // resolveFromElement(el) {
  //   if (!el) return null
  //   const ds = el.dataset || {}
    
  //   const laneId = ds.lane || null
  //   const axis = ds.axis || null
  //   const swipeType = ds.swipeType || null
  //   const actionId = ds.action || null
    
  //   const laneValid = laneId && axis && swipeType

  //   const reactions = this.buildReactions(ds, laneValid)
  //   return {
  //     element: el,
  //     laneId: laneValid ? laneId : null,
  //     axis: laneValid ? axis : null,
  //     swipeType: laneValid ? swipeType : null,
  //     actionId,
  //     // ----- SWIPE SPECIFICS -----
  //     ////////////////////////////////
  //     // ----- All -----
  //     laneSize: laneValid
  //     ? state.getSize(swipeType, laneId) 
  //     : null, // {x, y}

  //     // ----- CAROUSEL -----
  //     carouselStartOffset: laneValid && swipeType === 'carousel'
  //     ? state.getStartOffset('carousel', laneId) 
  //     : null, // number

  //     // ----- SLIDER -----
  //     sliderPosition: laneValid && swipeType === 'slider'
  //     ? state.getPosition('slider', laneId) 
  //     : null, // number
  //     sliderConstraints: laneValid && swipeType === 'slider'
  //     ? state.getConstraints('slider', laneId) 
  //     : null, //min, max

  //     // ----- DRAG -----
  //     dragPosition: laneValid && swipeType === 'drag'
  //     ? state.getPosition('drag', laneId) 
  //     : null, //{x, y}
  //     dragConstraints: laneValid && swipeType === 'drag'
  //     ? state.getConstraints('drag', laneId) 
  //     : null, //{minX, maxX, minY, maxY}

  //     // position: laneValid ? state.getPosition(swipeType, laneId) : null,
  //     // constraints: laneValid ? state.getConstraints(swipeType, laneId) : null,
  //     reactions
  //   }
  // },

  resolveFromPoint(x, y) {
    const elements = document.elementsFromPoint(x, y)

    for (const el of elements) {
      const ds = el.dataset || {}

      const laneValid = ds.lane && ds.axis && ds.swipeType
      const reactions = this.buildReactions(ds, laneValid)

      const isEligible = Object.values(reactions).some(Boolean)

      if (isEligible) {
        return this.resolveFromElement(el)
      }
    }

    return null
  },

  resolveLaneByAxis(x, y, inputAxis) {
    const el = document.elementsFromPoint(x, y).find(el => {
      const ds = el.dataset
      return ds?.lane && ds?.axis && (ds.axis === inputAxis || ds.axis === 'both')
    })

    return el ? this.resolveFromElement(el) : null
  },

  buildReactions(ds, laneValid) {
    const pressable = !!(ds.press !== undefined || ds.reactPress !== undefined || ds.action !== undefined)

    const swipeable = !!(
      ds.swipe !== undefined ||
      ds.reactSwipe !== undefined ||
      ds.reactSwipeStart !== undefined ||
      (laneValid)
    )
    const selectable = !!(ds.reactSelected !== undefined || pressable || swipeable)
    return {
      press: pressable,
      pressRelease: pressable,
      pressCancel: pressable || swipeable,
      swipeStart: swipeable,
      swipe: swipeable,
      swipeCommit: swipeable,
      swipeRevert: swipeable,
      select: selectable,
      deselect: selectable
    }
  }
}