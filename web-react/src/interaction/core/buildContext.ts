/* =========================
Context Builder
========================= */

import type { Context } from '@interaction/types/descriptor/baseType'
import { toAxis, toType } from '@interaction/types/primitiveType'

export function buildContext(el: HTMLElement): Context | null {
  const ds = el.dataset
  const id = ds.id ?? ''

  const axis = toAxis(ds.axis)
  const type = toType(ds.type)

  if (!type) return null
  if (type !== 'button' && !axis) return null

  const laneValid = Boolean(id && axis && type)
  const snapX = ds.snapX != null ? Number(ds.snapX) : null
  const snapY = ds.snapY != null ? Number(ds.snapY) : null
  const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
  const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
  const locked = ds.locked === 'true'
  return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
}