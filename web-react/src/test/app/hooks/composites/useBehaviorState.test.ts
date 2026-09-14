import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useBehaviorState } from '@composites/hooks/useBehaviorState.hook.ts'
import { settingsStore } from '@stores/settings.store.ts'

describe('[USE BEHAVIOR STATE]', () => {
  function renderBehaviorState(
    directive: Parameters<typeof useBehaviorState>[0]
  ) {
    return renderHook(() => useBehaviorState(directive))
  }

  describe('mode', () => {
    it('defaults to default mode', () => {
      const { result } = renderBehaviorState({})

      expect(result.current.mode).toBe('default')
    })

    it('maps true to on mode', () => {
      const { result } = renderBehaviorState({
        mode: true
      })

      expect(result.current.mode).toBe('on')
    })

    it('maps false to off mode', () => {
      const { result } = renderBehaviorState({
        mode: false
      })

      expect(result.current.mode).toBe('off')
    })

    it('preserves an explicit mode', () => {
      const { result } = renderBehaviorState({
        mode: 'disabled'
      })

      expect(result.current.mode).toBe('disabled')
    })
  })

  describe('interactivity', () => {
    it('defaults to interactive', () => {
      const { result } = renderBehaviorState({})

      expect(result.current.isInteractive).toBe(true)
    })

    it('respects interactive false', () => {
      const { result } = renderBehaviorState({
        interactive: false
      })

      expect(result.current.isInteractive).toBe(false)
    })

    it('respects interactive true', () => {
      const { result } = renderBehaviorState({
        interactive: true
      })

      expect(result.current.isInteractive).toBe(true)
    })
  })

  describe('drag interaction', () => {
    it('is not drag interactive when drag is disabled', () => {
      const { result } = renderBehaviorState({
        movable: true
      })

      expect(result.current.isDragInteractive).toBe(false)
    })

    it('is drag interactive when drag is enabled and movable', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          dragEnabled: true
        }
      })

      const { result } = renderBehaviorState({
        movable: true
      })

      expect(result.current.isDragInteractive).toBe(true)
    })

    it('is not drag interactive when the component is not interactive', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          dragEnabled: true
        }
      })

      const { result } = renderBehaviorState({
        movable: true,
        interactive: false
      })

      expect(result.current.isDragInteractive).toBe(false)
    })

    it('is not drag interactive when the component is not movable', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          dragEnabled: true
        }
      })

      const { result } = renderBehaviorState({
        interactive: true,
        movable: false
      })

      expect(result.current.isDragInteractive).toBe(false)
    })
  })

  describe('component interaction', () => {
    it('is component interactive when drag is disabled', () => {
      const { result } = renderBehaviorState({
        interactive: true,
        movable: true
      })

      expect(result.current.isCompInteractive).toBe(true)
    })

    it('is not component interactive when drag is enabled and movable', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          dragEnabled: true
        }
      })

      const { result } = renderBehaviorState({
        interactive: true,
        movable: true
      })

      expect(result.current.isCompInteractive).toBe(false)
    })

    it('is not component interactive when interactive is false', () => {
      const { result } = renderBehaviorState({
        interactive: false
      })

      expect(result.current.isCompInteractive).toBe(false)
    })
  })

  describe('flow', () => {
    it('defaults to being in flow', () => {
      const { result } = renderBehaviorState({})

      expect(result.current.isInFlow).toBe(true)
    })

    it('respects isInFlow false', () => {
      const { result } = renderBehaviorState({
        isInFlow: false
      })

      expect(result.current.isInFlow).toBe(false)
    })

    it('forces movable components into flow', () => {
      const { result } = renderBehaviorState({
        movable: true,
        isInFlow: false
      })

      expect(result.current.isInFlow).toBe(true)
    })
  })

  describe('resolved state', () => {
    it('returns the complete resolved behavior state', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          dragEnabled: true
        }
      })

      const { result } = renderBehaviorState({
        mode: 'on',
        interactive: true,
        movable: true,
        isInFlow: false
      })

      expect(result.current).toEqual({
        mode: 'on',
        isInteractive: true,
        movable: true,
        isDragInteractive: true,
        isCompInteractive: false,
        isInFlow: true
      })
    })
  })
})