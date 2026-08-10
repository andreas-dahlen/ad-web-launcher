import { normalizeParameter, sizeStore, type Device } from '@shared/state/stores/size.store'
import { testSize } from '@test/testAPI'
import { beforeEach, describe, expect, it } from 'vitest'

const { sanitizeDevice, computeScale } = testSize

describe('[SIZE STORE]', () => {
  describe('sanitizeDevice', () => {
    it('accepts a valid device payload', () => {
      const device = sanitizeDevice({
        width: 400,
        height: 800,
        density: 2
      })

      expect(device).toEqual({
        width: 400,
        height: 800,
        density: 2
      })
    })

    it('converts numeric values to numbers', () => {
      const device = sanitizeDevice({
        width: '400' as unknown as number,
        height: '800' as unknown as number,
        density: '2' as unknown as number
      })

      expect(device).toEqual({
        width: 400,
        height: 800,
        density: 2
      })
    })

    it('falls back when the payload is missing', () => {
      expect(sanitizeDevice(undefined)).toEqual(
        sizeStore.getState().device
      )
    })

    it.each([
      {
        name: 'non-numeric width',
        payload: {
          width: 'invalid',
          height: 800,
          density: 2
        }
      },
      {
        name: 'non-numeric height',
        payload: {
          width: 400,
          height: 'invalid',
          density: 2
        }
      },
      {
        name: 'non-numeric density',
        payload: {
          width: 400,
          height: 800,
          density: 'invalid'
        }
      },
      {
        name: 'infinite width',
        payload: {
          width: Infinity,
          height: 800,
          density: 2
        }
      },
      {
        name: 'infinite height',
        payload: {
          width: 400,
          height: Infinity,
          density: 2
        }
      },
      {
        name: 'infinite density',
        payload: {
          width: 400,
          height: 800,
          density: Infinity
        }
      },
      {
        name: 'zero density',
        payload: {
          width: 400,
          height: 800,
          density: 0
        }
      },
      {
        name: 'negative density',
        payload: {
          width: 400,
          height: 800,
          density: -1
        }
      }
    ])('falls back for $name', ({ payload }) => {
      expect(sanitizeDevice(payload as Partial<Device>)).toEqual(
        sizeStore.getState().device
      )
    })
  })

  describe('computeScale', () => {
    it('scales based on viewport height', () => {
      expect(
        computeScale(
          {
            width: 400,
            height: 800,
            density: 2
          },
          800,
          1600
        )
      ).toEqual({
        scale: 2
      })
    })

    it('limits scale when the scaled width exceeds the viewport', () => {
      expect(
        computeScale(
          {
            width: 400,
            height: 800,
            density: 2
          },
          600,
          1600
        )
      ).toEqual({
        scale: 1.5
      })
    })

    it('keeps the height-based scale when width fits', () => {
      expect(
        computeScale(
          {
            width: 400,
            height: 800,
            density: 2
          },
          800,
          1200
        )
      ).toEqual({
        scale: 1.5
      })
    })

    it('falls back to 1 when the computed scale is invalid', () => {
      expect(
        computeScale(
          {
            width: 400,
            height: 0,
            density: 2
          },
          800,
          NaN
        )
      ).toEqual({
        scale: 1
      })
    })

    it('falls back to 1 when the computed scale is negative', () => {
      expect(
        computeScale(
          {
            width: 400,
            height: 800,
            density: 2
          },
          800,
          -100
        )
      ).toEqual({
        scale: 1
      })
    })
  })

  describe('store state', () => {
    it('contains a device and scale', () => {
      const state = sizeStore.getState()

      expect(state.device).toEqual(
        expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
          density: expect.any(Number)
        })
      )

      expect(state.scale).toBeGreaterThan(0)
    })
  })

  describe('update', () => {
    it('recalculates scale using the current device', () => {
      const state = sizeStore.getState()

      const device = state.device

      const viewportWidth = device.width * 2
      const viewportHeight = device.height * 2

      state.update(viewportWidth, viewportHeight)

      expect(sizeStore.getState().scale).toBe(2)
    })

    it('limits scale when the viewport width is smaller', () => {
      const state = sizeStore.getState()
      const device = state.device

      const viewportHeight = device.height * 2
      const viewportWidth = device.width

      state.update(viewportWidth, viewportHeight)

      expect(sizeStore.getState().scale).toBe(1)
    })
  })

  describe('normalizeParameter', () => {
    beforeEach(() => {
      const state = sizeStore.getState()

      const device = state.device

      state.update(
        device.width * 2,
        device.height * 2
      )
    })

    it('divides the parameter by the current scale', () => {
      expect(
        sizeStore.getState().normalizeParameter(100)
      ).toBe(50)
    })

    it('is exposed through the module-level helper', () => {
      expect(normalizeParameter(100)).toBe(50)
    })

    it('supports decimal values', () => {
      expect(
        sizeStore.getState().normalizeParameter(25)
      ).toBe(12.5)
    })
  })
})