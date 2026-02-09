// dragPolicy.js
/**
 * Pure decision logic for drag behavior.
 * 
 * Contract:
 * - NO reactive state
 * - NO side effects
 * - NO DOM access
 * - Pure functions only
 * 
 * This is exactly like carousel, except:
 * - 2D deltas (x, y) instead of single axis
 * - No commit threshold (always commits on release)
 * - No revert behavior
 */

function clampDelta(delta, min, max) {
  if (min === undefined || max === undefined) return delta
  return Math.max(min, Math.min(max, delta))
}

export function clampDelta2D(delta, position, constraints) {
  const { x: dx, y: dy } = delta
  const { x: px, y: py } = position
  const { minX, maxX, minY, maxY } = constraints

  const clampedX = clampDelta(px + dx, minX, maxX)
  const clampedY = clampDelta(py + dy, minY, maxY)

  return {
    x: clampedX - px,
    y: clampedY - py
  }
}

export function clampCommitPosition(delta, position, constraints) {
  const { x: dx, y: dy } = delta
  const { x: px, y: py } = position
  const { minX, maxX, minY, maxY } = constraints

  const finalX = clampDelta(px + dx, minX, maxX)
  const finalY = clampDelta(py + dy, minY, maxY)
  return { x: finalX, y: finalY } // ✅ final absolute position
}

export function resolveDirection(deltaX, deltaY) {
  if (deltaX === 0 && deltaY === 0) return null
  
  // Dominant axis determines direction
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left'
  }
  return deltaY > 0 ? 'down' : 'up'
}
