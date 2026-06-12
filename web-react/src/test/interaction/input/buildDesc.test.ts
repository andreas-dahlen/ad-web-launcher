import { describe, expect, it } from 'vitest'
import { extractDomMeta } from '@interaction/input/domMeta'
import { createElByType } from '@test/functions.debug'
import type { InteractionType } from '@typing/core.types'

function resolveMeta(type: InteractionType) {
  const el = createElByType(type)
  const result = extractDomMeta(el)

  expect(result).not.toBeNull()
  if (!result) throw new Error('Expected meta but got null')

  expect(result.el).toBe(el)

  return result
}

describe('[EXTRACT DOMMETA]', () => {
  it('[CAROUSEL] meta package extracted', () => {
    const result = resolveMeta('carousel')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('horizontal')
    expect(result.type).toBe('carousel')
    expect(result.lockNextAt).toBe(3)
    expect(result.lockPrevAt).toBe(0)
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(true)
  })

  it('[DRAG] meta package extracted', () => {
    const result = resolveMeta('drag')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('both')
    expect(result.type).toBe('drag')
    expect(result.snapX).toBe(10)
    expect(result.snapY).toBe(20)
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(true)
  })
  it('[SLIDER] meta package extracted', () => {
    const result = resolveMeta('slider')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('horizontal')
    expect(result.type).toBe('slider')
    expect(result.instantSwipe).toBe(true)
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(true)
  })
  it('[SCROLL] meta package extracted', () => {
    const result = resolveMeta('scroll')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('vertical')
    expect(result.type).toBe('scroll')
    expect(result.onEdgeDir).toBe('left')
    expect(result.instantSwipe).toBe(true)
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(true)
  })

  it('[BUTTON] meta package extracted', () => {
    const result = resolveMeta('button')

    expect(result.id).toBe('test')
    expect(result.axis).toBeNull()
    expect(result.type).toBe('button')
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(false)
  })
})