/* =========================
Context Builder
========================= */

import type { DomMeta } from '../../typeScript/descriptor/baseType.ts'
import { toAxis, toType } from '../../typeScript/primitiveType.ts'

export function extractDomMeta(el: HTMLElement): DomMeta | null {
  const ds = el.dataset
  const id = ds.id ?? ''

  const axis = toAxis(ds.axis)
  const type = toType(ds.type)

  if (!type) return null
  if (type !== 'button' && !axis) return null

  const pressValid = Boolean(id && type)
  const swipeValid = Boolean(id && axis && type)

  const snapX = parseNumber(ds.snapX)
  const snapY = parseNumber(ds.snapY)
  const lockPrevAt = parseNumber(ds.lockPrevAt)
  const lockNextAt = parseNumber(ds.lockNextAt)

  const locked = ds.locked === 'true'

  return { el, ds, id, axis, type, swipeValid, pressValid, snapX, snapY, lockPrevAt, lockNextAt, locked }
}

function parseNumber(value: string | undefined): number | null {
  if (value == null) return null

  const num = Number(value)
  return Number.isNaN(num) ? null : num
}