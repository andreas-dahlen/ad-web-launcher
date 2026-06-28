import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim';
import css from './Composites.module.css'
import clsx from 'clsx';

type SettingsButtonProps = {
  id: string
  value?: boolean
  ReactImg: React.FC<React.SVGProps<SVGSVGElement>>
  setValue: () => void
  className?: string
  isEnabled?: boolean
  msg?: string
}

export default function SettingsButton({
  id,
  value,
  className,
  setValue,
  ReactImg,
  isEnabled,
  msg }: SettingsButtonProps
) {

  return (
    <div className={css.item}>

      <span>{msg}</span>
      <ButtonPrim
        id={id}
        className={clsx(css.button, className)}
        onPressRelease={setValue}
        interactive={isEnabled}
        buttonDataAttrs={{
          'active': value ?? false,
          'enabled': isEnabled,
          'state': 'released'
        }}
      >
        <ReactImg className={clsx(css.svg,
          value === undefined && css.default,
          value ? css.dark : css.bright)}
        />
      </ButtonPrim>
    </div>
  )
}