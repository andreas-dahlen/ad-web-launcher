import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.ts'

import buttonCss from './Button.module.css'
import clsx from 'clsx'
import { dasx } from '@utils/dataAttrs'
import type { ButtonProps } from '@primitives/prim.types'


export default function Button({
  id,
  className,
  action,
  interactive = true,
  onPressRelease,
  children,
  buttonDataAttrs
}: ButtonProps & React.HTMLAttributes<HTMLDivElement>) {

  const buttonRef = useRef<HTMLDivElement>(null)

  usePointerBridge({
    elRef: buttonRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      const event = reaction.detail
      if (!event) return

      if (event === 'pressRelease' && onPressRelease) {
        onPressRelease(reaction.detail)
      }
    }
  })

  return (
    <div
      className={clsx(buttonCss.button, className)}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      ref={buttonRef}
      {...dasx({
        type: "button",
        frame: "button",
        id,
        action,
        ...buttonDataAttrs
      })}
    >
      {children}
    </div>
  )
}