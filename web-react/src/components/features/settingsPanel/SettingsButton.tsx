import Button from '@components/primitives/button/Button';

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
    <div className='settings-item'>

      <span>{msg}</span>
      <Button
        id={id}
        className={`settings-button ${className}`}
        onPressRelease={setValue}
        interactive={isEnabled}
        buttonDataAttrs={{
          'data-active': value ?? false,
          'data-enabled': isEnabled,
          'data-state': 'released'
        }}
      >
        <ReactImg className={`svg-img ${value === true ? 'svg-dark' : value === false ? 'svg-bright' : 'svg-default'}`} />
      </Button>
    </div>
  )
}