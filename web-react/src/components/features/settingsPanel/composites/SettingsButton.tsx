import Button from '@components/primitives/button/Button';
import compositeCss from './Composites.module.css'
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
    <div className={compositeCss.item}>

      <span>{msg}</span>
      <Button
        id={id}
        className={clsx(compositeCss.button, className)}
        onPressRelease={setValue}
        interactive={isEnabled}
        buttonDataAttrs={{
          'active': value ?? false,
          'enabled': isEnabled,
          'state': 'released'
        }}
      >
        <ReactImg className={clsx(compositeCss.svg,
          value === undefined && compositeCss.default,
          value ? compositeCss.dark : compositeCss.bright)}
        />
      </Button>
    </div>
  )
}