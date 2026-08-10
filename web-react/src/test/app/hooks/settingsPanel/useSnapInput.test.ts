import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSnapInput } from '@panels/SettingsPanel/hooks/useSnapInput'

describe('[USE SNAP INPUT]', () => {
  function renderSnapInput(
    overrides: Partial<Parameters<typeof useSnapInput>[0]> = {}
  ) {
    const onChange = vi.fn()

    const props = {
      value: 8,
      min: 0,
      max: 16,
      step: 2,
      enabled: true,
      onChange,
      ...overrides
    }

    return {
      ...renderHook(() => useSnapInput(props)),
      onChange
    }
  }

  describe('increment', () => {
    it('can increment when enabled and below max', () => {
      const { result } = renderSnapInput({
        value: 8
      })

      expect(result.current.canIncrement).toBe(true)
    })

    it('increments by the configured step', () => {
      const { result, onChange } = renderSnapInput({
        value: 8,
        step: 2
      })

      result.current.increment()

      expect(onChange).toHaveBeenCalledWith(10)
    })

    it('clamps increment to max', () => {
      const { result, onChange } = renderSnapInput({
        value: 15,
        max: 16,
        step: 4
      })

      result.current.increment()

      expect(onChange).toHaveBeenCalledWith(16)
    })

    it('cannot increment at max', () => {
      const { result } = renderSnapInput({
        value: 16,
        max: 16
      })

      expect(result.current.canIncrement).toBe(false)
    })

    it('does not call onChange when increment is unavailable', () => {
      const { result, onChange } = renderSnapInput({
        value: 16,
        max: 16
      })

      result.current.increment()

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('decrement', () => {
    it('can decrement when enabled and above min', () => {
      const { result } = renderSnapInput({
        value: 8
      })

      expect(result.current.canDecrement).toBe(true)
    })

    it('decrements by the configured step', () => {
      const { result, onChange } = renderSnapInput({
        value: 8,
        step: 2
      })

      result.current.decrement()

      expect(onChange).toHaveBeenCalledWith(6)
    })

    it('clamps decrement to min', () => {
      const { result, onChange } = renderSnapInput({
        value: 1,
        min: 0,
        step: 4
      })

      result.current.decrement()

      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('cannot decrement at min', () => {
      const { result } = renderSnapInput({
        value: 0,
        min: 0
      })

      expect(result.current.canDecrement).toBe(false)
    })

    it('does not call onChange when decrement is unavailable', () => {
      const { result, onChange } = renderSnapInput({
        value: 0,
        min: 0
      })

      result.current.decrement()

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('enabled', () => {
    it('defaults to enabled', () => {
      const { result } = renderSnapInput({
        enabled: undefined
      })

      expect(result.current.canIncrement).toBe(true)
      expect(result.current.canDecrement).toBe(true)
    })

    it('disables increment when disabled', () => {
      const { result, onChange } = renderSnapInput({
        enabled: false
      })

      expect(result.current.canIncrement).toBe(false)

      result.current.increment()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('disables decrement when disabled', () => {
      const { result, onChange } = renderSnapInput({
        enabled: false
      })

      expect(result.current.canDecrement).toBe(false)

      result.current.decrement()

      expect(onChange).not.toHaveBeenCalled()
    })
  })
})