import type { BaseInteraction, LayoutData } from '@interaction/types/descriptor/base.types.ts'
import { createEl } from '@test/app/interaction/builders/domAndMeta.factory.ts'

export const base_DEFAULT: {
  base: BaseInteraction
  layout: LayoutData
} = {
  base: {
    pointerId: 1,
    element: createEl(),
    id: 'test'
  },
  layout: {
    deviceSize: { width: 100, height: 100 },
    frameRect: { left: 50, top: 50 },
    grabOffset: { x: 10, y: 10 },
    containerSize: { width: 100, height: 100 },
    itemSize: { width: 10, height: 10 }
  }
}

export const baseSwipe_DEFAULT = {
  ...base_DEFAULT.base,
  layout: base_DEFAULT.layout,
}