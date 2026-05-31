import { describe, expect, it } from 'vitest'
import { extractDomMeta } from '@interaction/core/domMeta'
import { createMetaEl } from '@test/functions'

describe('extractDomMeta', () => {
  it('extracts full dom meta package from element dataset', () => {
    // -------------------------
    // Arrange
    // -------------------------

    const el = createMetaEl({
      id: 'drag-test',
      axis: 'both',
      type: 'drag',
      onEdgeDir: 'left',
      instantSwipe: 'true',
      snapX: '10',
      snapY: '20',
      lockNextAt: '3',
      lockPrevAt: '2',
    })

    // -------------------------
    // Act
    // -------------------------
    const result = extractDomMeta(el)

    // -------------------------
    // Assert (existence)
    // -------------------------
    expect(result).not.toBeNull()

    if (!result) return

    expect(result.el).toBe(el)
    expect(result.id).toBe('drag-test')

    // -------------------------
    // Assert (parsing)
    // -------------------------
    expect(result.axis).toBe('both')
    expect(result.type).toBe('drag')
    expect(result.onEdgeDir).toBe('left')

    expect(result.snapX).toBe(10)
    expect(result.snapY).toBe(20)
    expect(result.lockNextAt).toBe(3)
    expect(result.lockPrevAt).toBe(2)

    // -------------------------
    // Assert (capabilities)
    // -------------------------
    expect(result.pressable).toBe(true)
    expect(result.swipeable).toBe(true)
    expect(result.instantSwipe).toBe(true)
  })
})