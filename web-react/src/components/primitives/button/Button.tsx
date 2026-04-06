import { useRef } from "react"
import { usePointerForwarding } from "@components/hooks/bridge.ts"

export interface ButtonProps {
  id: string
  className?: string
  action?: string
  reactPress?: boolean
  reactPressRelease?: boolean
  reactPressCancel?: boolean
  interactive?: boolean
  onPress?: (detail: unknown) => void
  onPressRelease?: (detail: unknown) => void
  onPressCancel?: (detail: unknown) => void
  children?: React.ReactNode
}

export default function Button({
  id,
  className,
  action,
  reactPress,
  reactPressRelease,
  reactPressCancel,
  interactive = true,
  onPress,
  onPressRelease,
  onPressCancel,
  children,
  ...rest
}: ButtonProps & React.HTMLAttributes<HTMLDivElement>) {

  const buttonRef = useRef<HTMLDivElement>(null)

  usePointerForwarding({
    elRef: buttonRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      const event = reaction.detail?.event
      if (!event) return

      if (event === 'press' && reactPress && onPress) {
        onPress(reaction.detail)
      }
      if (event === 'pressRelease' && reactPressRelease && onPressRelease) {
        onPressRelease(reaction.detail)
      }
      if (event === 'pressCancel' && reactPressCancel && onPressCancel) {
        onPressCancel(reaction.detail)
      }
    }
  })

  return (
    <div className="non-interactive-default">
      <div
        ref={buttonRef}
        {...rest}
        className={`interactive-default ${className ?? ''}`}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
        data-type="button"
        data-id={id}
        data-press={true}
        data-action={action || undefined}
        data-react-press={reactPress || undefined}
        data-react-press-release={reactPressRelease || undefined}
        data-react-press-cancel={reactPressCancel || undefined}
      >
        {children}
      </div>
    </div>
  )
}