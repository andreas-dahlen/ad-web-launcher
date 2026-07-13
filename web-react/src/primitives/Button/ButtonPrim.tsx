import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook'
import css from './ButtonPrim.module.css'
import clsx from 'clsx'
import { dasx } from '@utils/dasx'
import type { ButtonPrimProps } from '@primitives/types/prim.types'
import { svsx } from '@utils/svsx'
import { buttonPreset } from '@composites/Button/ButtonPrim.vars'
import { cpsx } from '@utils/cpsx'
import { buttonStyle } from '@schema/components'
import vars from '@styleSystem/tokens.module.css'

export default function ButtonPrim({
  id,
  presets,
  action,
  interactive = true,
  isInFlow = true,
  onPressRelease,
  children,
  buttonDataAttrs,
  styleVars
}: ButtonPrimProps) {

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
      className={clsx(vars.buttonCompiler, css.button, ...cpsx(presets, buttonPreset))}
      style={{
        pointerEvents: interactive ? "auto" : "none",
        position: isInFlow ? "relative" : "absolute",
        ...svsx(styleVars ?? {}, buttonStyle)
      }}
      ref={buttonRef}
      {...dasx({
        type: "button",
        frame: "button",
        id,
        action,
        ...buttonDataAttrs
      })}
    >
      <div className={css.transformWrapper} />

      <div className={css.contentWrapper}>
        {children}
      </div>

    </div>
  )
}