/* =========================
Context Builder
========================= */

import type { Context } from '@interaction/types/descriptor/baseType'
import { VALID_AXES, VALID_TYPES, type Axis, type InteractionType } from '@interaction/types/primitiveType'

export function buildContext(el: HTMLElement): Context | null {
  const ds = el.dataset
  const id = ds.id ?? ''

  if (!ds.type || !VALID_TYPES.has(ds.type)) return null
  if (ds.type !== 'button' && (!ds.axis || !VALID_AXES.has(ds.axis))) return null

  const axis = (ds.axis as Axis) ?? null
  const type = (ds.type as InteractionType) ?? null
  const laneValid = Boolean(id && axis && type)
  const snapX = ds.snapX != null ? Number(ds.snapX) : null
  const snapY = ds.snapY != null ? Number(ds.snapY) : null
  const lockPrevAt = ds.lockPrevAt != null ? Number(ds.lockPrevAt) : null
  const lockNextAt = ds.lockNextAt != null ? Number(ds.lockNextAt) : null
  const locked = ds.locked === 'true'
  return { el, ds, id, axis, type, laneValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
}