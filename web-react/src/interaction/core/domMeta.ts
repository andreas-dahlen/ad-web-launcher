/* =========================
Context Builder
========================= */

import type { DomMeta } from '../types/base.types.ts'
import { toAxis, toOnEdgeDir, toType } from '../../shared/typing/core.types.ts'

export function extractDomMeta(el: HTMLElement): DomMeta | null {
  console.log(el)
  const ds = el.dataset
  const id = ds.id ?? ''

  const axis = toAxis(ds.axis)
  const type = toType(ds.type)
  const onEdgeDir = toOnEdgeDir(ds.onEdgeDir)

  if (!type) return null
  if (type !== 'button' && !axis) return null

  const pressable = Boolean(id && type)
  const swipeable = Boolean(id && axis && type)
  const instantSwipe = ds.instantSwipe === 'true'

  const snapX = parseNumber(ds.snapX)
  const snapY = parseNumber(ds.snapY)
  const lockPrevAt = parseNumber(ds.lockPrevAt)
  const lockNextAt = parseNumber(ds.lockNextAt)
  return { el, ds, id, axis, type, swipeable, pressable, snapX, snapY, lockPrevAt, lockNextAt, onEdgeDir, instantSwipe }
}

function parseNumber(value: string | undefined): number | null {
  if (value == null) return null

  const num = Number(value)
  return Number.isNaN(num) ? null : num
}