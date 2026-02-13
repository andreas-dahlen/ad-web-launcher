import { state } from '../state/stateManager'

export function buildContext(el, reactions = {}) {
    if (!el) return null
    const defaultReactions = {
        press: false,
        pressRelease: false,
        pressCancel: false,
        swipeStart: false,
        swipe: false,
        swipeCommit: false,
        swipeRevert: false,
        select: false,
        deselect: false
    }

    const axis = el.dataset.axis
    const laneId = el.dataset.lane
    const swipeType = el.dataset.swipeType

      const valid = Boolean(swipeType && laneId)

    return {
        element: el,
        laneId: laneId ?? null,
        axis: axis ?? null,
        swipeType: swipeType ?? null,

        laneSize: valid ? state.getSize(swipeType, laneId) : null,
        position: valid ? state.getPosition(swipeType, laneId): null,
        constraints: valid ? state.getConstraints(swipeType, laneId) : null,

        reactions: {
            ...defaultReactions,
            ...reactions
        }
    }
}
