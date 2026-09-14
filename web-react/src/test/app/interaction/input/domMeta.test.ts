import { describe, expect, it } from 'vitest'
import { createMetaByType } from '@test/app/interaction/builders/domAndMeta.factory.ts'

describe('[EXTRACT DOMMETA]', () => {
  it('[CAROUSEL] meta package extracted', () => {
    const result = createMetaByType('carousel')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('horizontal')
    expect(result.type).toBe('carousel')
    expect(result.lockNextAt).toBe(3)
    expect(result.lockPrevAt).toBe(0)
    expect(result.isPressable).toBe(true)
    expect(result.isSwipeable).toBe(true)
  })

  it('[DRAG] meta package extracted', () => {
    const result = createMetaByType('drag')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('both')
    expect(result.type).toBe('drag')
    expect(result.snapX).toBe(10)
    expect(result.snapY).toBe(20)
    expect(result.isPressable).toBe(true)
    expect(result.isSwipeable).toBe(true)
  })
  it('[SLIDER] meta package extracted', () => {
    const result = createMetaByType('slider')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('horizontal')
    expect(result.type).toBe('slider')
    expect(result.isInstantSwipe).toBe(true)
    expect(result.isPressable).toBe(true)
    expect(result.isSwipeable).toBe(true)
  })
  it('[SCROLL] meta package extracted', () => {
    const result = createMetaByType('scroll')

    expect(result.id).toBe('test')
    expect(result.axis).toBe('vertical')
    expect(result.type).toBe('scroll')
    expect(result.overflowSide).toBe('left')
    expect(result.isInstantSwipe).toBe(true)
    expect(result.isPressable).toBe(true)
    expect(result.isSwipeable).toBe(true)
  })

  it('[BUTTON] meta package extracted', () => {
    const result = createMetaByType('button')

    expect(result.id).toBe('test')
    expect(result.axis).toBeNull()
    expect(result.type).toBe('button')
    expect(result.isPressable).toBe(true)
    expect(result.isSwipeable).toBe(false)
  })
})