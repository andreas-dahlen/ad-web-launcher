import { useRef } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.hook'
import css from './ButtonPrim.module.css'
import clsx from 'clsx'
import { dasx } from '@utils/dataAttrs'
import type { ButtonPrimProps } from '@primitives/prim.types'


export default function ButtonPrim({
  id,
  className,
  action,
  interactive = true,
  onPressRelease,
  children,
  buttonDataAttrs
}: ButtonPrimProps & React.HTMLAttributes<HTMLDivElement>) {

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
      className={clsx(css.button, className)}
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
      <div className={css.content}>
        {children}
      </div>
    </div>
  )
}