import { useRef } from "react"
import { usePointerBridge } from '../../hooks/pointerBridge.ts'
import type { ButtonProps } from '@typeScript/propsType.ts'

export default function Button({
  id,
  className,
  action,
  interactive = true,
  // onPress,
  // onPressCancel,
  onPressRelease,
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

      // if (event === 'press' && onPress) {
      //   onPress(reaction.detail)
      // }
      // if (event === 'pressCancel' && onPressCancel) {
      //   onPressCancel(reaction.detail)
      // }
      if (event === 'pressRelease' && onPressRelease) {
        onPressRelease(reaction.detail)
      }
    }
  })

  return (
    <div
      ref={buttonRef}
      {...rest}
      className={`button ${className ?? ''}`}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      data-type="button"
      data-id={id}
      data-action={action || undefined}
    >
      {children}
    </div>
  )
}