import { useRef } from "react"
import { usePointerBridge } from '../../hooks/pointerBridge.ts'
import type { CtxType } from '@typeScript/ctxType.ts'

export interface ButtonProps {
  id: string
  className?: string
  action?: string
  interactive?: boolean
  onPress?: (detail: CtxType) => void
  onPressRelease?: (detail: CtxType) => void
  onPressCancel?: (detail: CtxType) => void
  children?: React.ReactNode
}

export default function Button({
  id,
  className,
  action,
  interactive = true,
  onPress,
  onPressRelease,
  onPressCancel,
  children,
  ...rest
}: ButtonProps & React.HTMLAttributes<HTMLDivElement>) {

  const buttonRef = useRef<HTMLDivElement>(null)

  usePointerBridge({
    elRef: buttonRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      const event = reaction.detail?.event
      if (!event) return

      if (event === 'press' && onPress) {
        onPress(reaction.detail)
      }
      if (event === 'pressRelease' && onPressRelease) {
        onPressRelease(reaction.detail)
      }
      if (event === 'pressCancel' && onPressCancel) {
        onPressCancel(reaction.detail)
      }
    }
  })

  return (
    <div
      ref={buttonRef}
      {...rest}
      className={`default-button ${className ?? ''}`}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      data-type="button"
      data-id={id}
      data-action={action || undefined}
    >
      {children}
    </div>
  )
}