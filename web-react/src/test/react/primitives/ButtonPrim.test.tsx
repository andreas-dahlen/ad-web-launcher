import { render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ButtonPrim from '@primitives/Button/ButtonPrim'
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook'
import type { EventType } from '@shared/types/core.types'

vi.mock('@interaction/adapter/usePointerBridge.hook', () => ({
  usePointerBridge: vi.fn()
}))

describe('[BUTTON PRIM]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderButton(
    props: Partial<ComponentProps<typeof ButtonPrim>> = {}
  ) {
    return render(
      <ButtonPrim
        id="test-button"
        {...props}
      >
        Button
      </ButtonPrim>
    )
  }

  function getButton(container: HTMLElement) {
    return container.firstElementChild as HTMLElement
  }

  function getBridgeOptions() {
    const calls = vi.mocked(usePointerBridge).mock.calls

    expect(calls).toHaveLength(1)

    return calls[0][0]
  }

  describe('rendering', () => {
    it('renders its children', () => {
      const { getByText } = renderButton()

      expect(getByText('Button')).toBeInTheDocument()
    })

    it('renders the id as a data attribute', () => {
      const { container } = renderButton()

      expect(getButton(container)).toHaveAttribute(
        'data-id',
        'test-button'
      )
    })

    it('renders the button type and frame data attributes', () => {
      const { container } = renderButton()

      const button = getButton(container)

      expect(button).toHaveAttribute(
        'data-type',
        'button'
      )

      expect(button).toHaveAttribute(
        'data-frame',
        'button'
      )
    })

    it('applies custom button data attributes', () => {
      const { container } = renderButton({
        buttonDataAttrs: {
          testId: 'button-test',
          active: true
        }
      })

      const button = getButton(container)

      expect(button).toHaveAttribute(
        'data-test-id',
        'button-test'
      )

      expect(button).toHaveAttribute(
        'data-active',
        'true'
      )
    })

    it('allows custom data attributes to override generated attributes', () => {
      const { container } = renderButton({
        buttonDataAttrs: {
          type: 'custom'
        }
      })

      expect(getButton(container)).toHaveAttribute(
        'data-type',
        'custom'
      )
    })
  })

  describe('interactive', () => {
    it('is interactive by default', () => {
      const { container } = renderButton()

      expect(getButton(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('enables pointer interaction when interactive is true', () => {
      const { container } = renderButton({
        interactive: true
      })

      expect(getButton(container)).toHaveStyle({
        pointerEvents: 'auto'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('disables pointer interaction when interactive is false', () => {
      const { container } = renderButton({
        interactive: false
      })

      expect(getButton(container)).toHaveStyle({
        pointerEvents: 'none'
      })

      expect(getBridgeOptions()).toEqual(
        expect.objectContaining({
          disabled: true
        })
      )
    })
  })

  describe('positioning', () => {
    it('is positioned in flow by default', () => {
      const { container } = renderButton()

      expect(getButton(container)).toHaveStyle({
        position: 'relative'
      })
    })

    it('uses relative positioning when isInFlow is true', () => {
      const { container } = renderButton({
        isInFlow: true
      })

      expect(getButton(container)).toHaveStyle({
        position: 'relative'
      })
    })

    it('uses absolute positioning when isInFlow is false', () => {
      const { container } = renderButton({
        isInFlow: false
      })

      expect(getButton(container)).toHaveStyle({
        position: 'absolute'
      })
    })
  })

  describe('reaction handling', () => {
    it('calls onPressRelease for a pressRelease reaction', () => {
      const onPressRelease = vi.fn()

      renderButton({
        onPressRelease
      })

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'pressRelease' as EventType
      })

      onReaction?.(reaction)

      expect(onPressRelease).toHaveBeenCalledTimes(1)
      expect(onPressRelease).toHaveBeenCalledWith(
        'pressRelease'
      )
    })

    it('ignores reactions other than pressRelease', () => {
      const onPressRelease = vi.fn()

      renderButton({
        onPressRelease
      })

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'press' as EventType
      })

      onReaction?.(reaction)

      expect(onPressRelease).not.toHaveBeenCalled()
    })

    it('does nothing when onPressRelease is not provided', () => {
      renderButton()

      const { onReaction } = getBridgeOptions()

      const reaction = new CustomEvent('reaction', {
        detail: 'pressRelease' as EventType
      })

      expect(() => {
        onReaction?.(reaction)
      }).not.toThrow()
    })
  })
})