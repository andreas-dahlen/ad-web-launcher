import { describe, it, expect, beforeEach } from 'vitest'
import { gestureStore } from '@shared/state/stores/gesture.store.ts'

describe("[GESTURESTORE]", () => {
  beforeEach(() => {
    gestureStore.setState({
      activeGesture: 'none',
      gestureNodes: {}
    })
  })
  it('adds gesture node and sets activeGesture', () => {
    gestureStore.getState().increment('carousel', 1)
    const state = gestureStore.getState()
    expect(state.gestureNodes[1]).toEqual({
      pointerId: 1,
      type: 'carousel',
      isLongPress: false
    })
    expect(state.activeGesture).toBe('carousel')
  })

  it('ignores duplicate pointerId', () => {
    gestureStore.getState().increment('carousel', 1)
    gestureStore.getState().increment('drag', 1)

    const state = gestureStore.getState()

    expect(Object.keys(state.gestureNodes).length).toBe(1)
    expect(state.activeGesture).toBe('carousel')
  })

  it('removes gesture node', () => {
    gestureStore.getState().increment('drag', 1)
    gestureStore.getState().decrement(1)

    const state = gestureStore.getState()

    expect(state.gestureNodes[1]).toBeUndefined()
    expect(state.activeGesture).toBe('none')
  })


  it('sets activeGesture to remaining gesture type', () => {
    gestureStore.getState().increment('carousel', 1)
    gestureStore.getState().increment('drag', 2)

    gestureStore.getState().decrement(1)

    const state = gestureStore.getState()

    expect(state.activeGesture).toBe('drag')
  })

  it('sets long press', () => {
    gestureStore.getState().increment('carousel', 1)
    gestureStore.getState().setLongPress(1)

    const gesture = gestureStore.getState().gestureNodes[1]

    expect(gesture.isLongPress).toBe(true)

  })
})