import { createComputed } from '@test/fixtures/computed'
import { createCarouselDesc, createDragDesc } from '@test/fixtures/desc'
import type { CreateCarouselInputOverride, CreateDragInputOverride } from '@test/fixtures/override.types'
import { createRuntime } from '@test/fixtures/runtimeAndSolutions'

export function createCarouselInput(overrides: CreateCarouselInputOverride = {}) {
  return {
    runtime: createRuntime(overrides?.runtime),
    desc: createCarouselDesc(overrides?.desc),
    computed: createComputed(overrides?.computed)
  }
}
export function createDragInput(overrides: CreateDragInputOverride = {}) {
  return {
    runtime: createRuntime(overrides?.runtime),
    desc: createDragDesc(overrides?.desc),
    computed: createComputed(overrides?.computed)
  }
}