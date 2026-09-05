import { useRef } from "react"
import { usePointerBridge } from '@interaction/adapter/usePointerBridge.hook.ts'
import css from './Button.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/sxCompiler/dasx.ts'
import type { ButtonPrimProps } from '@primitives/types/prim.types.ts'
import { svsx } from '../../shared/sxCompiler/svsx.ts'
import { cpsx } from '../../shared/sxCompiler/cpsx.ts'
import { buttonStyle } from '@generated/tokenModules/button.token.ts'
import { buttonPreset } from '@generated/presets/button.preset.ts'

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
      className={clsx(css.button,
        ...cpsx(presets, buttonPreset)
      )}
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
      <div className={css.visual} />

      <div className={css.content}>
        {children}
      </div>

    </div>
  )
}