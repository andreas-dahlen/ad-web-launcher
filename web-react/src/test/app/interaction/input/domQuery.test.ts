import * as buildDesc from '@interaction/input/buildDesc'
import * as extract from '@interaction/input/domMeta'
import { domQuery } from '@interaction/input/domQuery.ts'
import { gestureUtils } from '@interaction/input/gesture.utils.ts'
import type { Descriptor } from '@interaction/types/descriptor/descriptor.types.ts'
import { createInteractionElement, createEl } from '@test/app/interaction/builders/domAndMeta.factory.ts'
import { createDesc } from '@test/app/interaction/builders/input.factory.ts'
import type { Axis, InteractionType } from '@shared/types/core.types.ts'
import { toType } from '@interaction/assertions/assertions.ts'
import { afterEach, describe, expect, it, vi } from 'vitest'

function initDomTest(opts: { validAt: number; type?: string }) {
  const elements: Element[] = []

  const invalidCount = opts.validAt - 1

  for (let i = 0; i < invalidCount; i++) {
    elements.push(createEl())
  }

  const type = toType(opts.type)

  elements.push(
    type
      ? createInteractionElement(type)
      : createEl()
  )

  Object.defineProperty(document, "elementsFromPoint", {
    value: vi.fn(() => elements),
    writable: true,
  })
}

function mockCompileDesc(type: InteractionType = "button") {
  const desc = createDesc(type)
  vi.spyOn(buildDesc, "compileDescriptor").mockReturnValue(desc)
  const spy = vi.spyOn(extract, "extractDomMeta")
  return spy
}

function mockInvalidDesc() {
  vi.spyOn(buildDesc, "compileDescriptor").mockReturnValue("clearly wrong xD" as unknown as Descriptor)
  const spy = vi.spyOn(extract, "extractDomMeta")
  return spy
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("[DOMQUERY]", () => {

  describe("[Find Target In Dom]", () => {


    it.each<[string, number]>([
      ["carousel", 1],
      ["button", 2],
      ["drag", 3],
      ["slider", 4],
      ["scroll", 5],
      ["button", 6]
    ])("find the first valid metaData and generate descriptor (%s)",
      (type, validAt) => {
        initDomTest({ validAt, type: type as InteractionType })
        const spy = mockCompileDesc(type as InteractionType)

        const result = domQuery.findTargetInDom(100, 100, 1)

        expect(result?.type).toBe(type)
        expect(spy).toHaveBeenCalledTimes(validAt)

      })

    it.each<[string, number]>([
      ["banana", 1],
      ["bluebarry", 2],
      ["squash", 3],
      ["null", 4],
      ["apple", 5],
      ["cucumber", 6]
    ])("returns null if a valid descriptor ins't found (%s)",
      (type, invalidAt) => {
        initDomTest({ validAt: invalidAt, type: type as InteractionType })
        const spy = mockInvalidDesc()

        const result = domQuery.findTargetInDom(100, 100, 1)

        expect(result).toBe(null)
        expect(spy).toHaveBeenCalledTimes(invalidAt)

      })
  })

  describe("[Find Lane In Dom]", () => {
    it.each<[string, string, number]>([
      ["carousel", "horizontal", 1],
      ["drag", "both", 3],
      ["slider", "horizontal", 4],
      ["scroll", "vertical", 5],
    ])("find the first valid metaData and generate descriptor (%s) axis: (%s)",
      (type, axis, validAt) => {
        initDomTest({ validAt, type: type as InteractionType })
        const spy = mockCompileDesc(type as InteractionType)

        const result = domQuery.findLaneInDom(100, 100, axis as Axis, 1)

        expect(result?.type).toBe(type)
        expect(spy).toHaveBeenCalledTimes(validAt)

      })

    it.each<[string, string, number]>([
      ["carousel", "vertical", 2],
      ["slider", "both", 7],
      ["scroll", "horizontal", 14],
      ["banana", "horizontal", 14],
      ["tree", "vertical", 20],
      ["woopsie", "both", 20],

    ])("returns null if a descriptor ins't found that matches intentAxis(%s)",
      (type, intentAxis, validAt) => {
        initDomTest({ validAt, type: type as InteractionType })
        const spy = mockInvalidDesc()

        const result = domQuery.findLaneInDom(100, 100, intentAxis as Axis, 1)

        expect(result).toBe(null)
        expect(spy).toHaveBeenCalledTimes(validAt)
      })
  })


  function createFrame(rect: DOMRectReadOnly) {
    return {
      getBoundingClientRect: () => rect,
    } as unknown as HTMLElement
  }

  function createElement(frame: HTMLElement) {
    return {
      closest: () => frame,
    } as unknown as HTMLElement
  }

  describe("[Get El Snapshot]", () => {
    it("should throw when an element isn't found", () => {
      const el = {
        closest: () => null,
      } as unknown as Element

      expect(() => {
        domQuery.getElSnapshot(100, 100, el)
      }).toThrow("No data-frame found for interaction element")

    })
    it("should return grabOffset and frame", () => {

      const rect = {
        left: 100,
        top: 50,
        width: 200,
        height: 200,
      } as DOMRectReadOnly

      const frame = createFrame(rect)
      const el = createElement(frame)

      const result = domQuery.getElSnapshot(120, 80, el)

      expect(result).toHaveProperty("frame")
      expect(result).toHaveProperty("grabOffset")

    })
    it("should call normalizeFrame", () => {
      const spy = vi.spyOn(gestureUtils, "normalizeFrame")


      const rect = {
        left: 100,
        top: 50,
        width: 200,
        height: 200,
      } as DOMRectReadOnly

      const frame = createFrame(rect)
      const el = createElement(frame)
      domQuery.getElSnapshot(120, 80, el)

      expect(spy).toHaveBeenCalledTimes(1)
    })
    it("should call normalizeVec2", () => {
      const spy = vi.spyOn(gestureUtils, "normalizeVec2")


      const rect = {
        left: 100,
        top: 50,
        width: 200,
        height: 200,
      } as DOMRectReadOnly

      const frame = createFrame(rect)
      const el = createElement(frame)
      domQuery.getElSnapshot(120, 80, el)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})