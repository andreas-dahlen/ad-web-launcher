import { createComputed } from '@test/fixtures/computed'
import { createButtonDesc, createCarouselDesc, createDragDesc, createScrollDesc, createSliderDesc } from '@test/fixtures/desc'
import type { CreateButtonInputOverride, CreateCarouselInputOverride, CreateDragInputOverride, CreateScrollInputOverride, CreateSliderInputOverride } from '@test/fixtures/override.types'
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
export function createSliderInput(overrides: CreateSliderInputOverride = {}) {
  return {
    runtime: createRuntime(overrides?.runtime),
    desc: createSliderDesc(overrides?.desc),
    computed: createComputed(overrides?.computed)
  }
}
export function createScrollInput(overrides: CreateScrollInputOverride = {}) {
  return {
    runtime: createRuntime(overrides?.runtime),
    desc: createScrollDesc(overrides?.desc),
    computed: createComputed(overrides?.computed)
  }
}
export function createButtonInput(overrides: CreateButtonInputOverride = {}) {
  return {
    runtime: createRuntime(overrides?.runtime),
    desc: createButtonDesc(overrides?.desc),
    computed: createComputed(overrides?.computed)
  }
}