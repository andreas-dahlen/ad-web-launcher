import Button from '@components/primitives/button/Button';

type SettingsButtonProps = {
  id: string
  value: boolean
  enabled?: boolean
  setValue: () => void
  msg?: string
  defaultState?: string
  ReactImg: React.FC<React.SVGProps<SVGSVGElement>>
}

export default function SettingsButton({
  id,
  value,
  setValue,
  ReactImg,
  enabled,
  msg }: SettingsButtonProps
) {

  return (
    <div className='settings-item'>

      <span>{msg}</span>
      <Button
        id={id}
        className='settings-button'
        onPressRelease={setValue}
        interactive={enabled}
        buttonDataAttrs={{
          'data-active': value,
          'data-enabled': enabled,
          'data-state': 'released'
        }}
      >
        <ReactImg className={value ?
          'svg-img svg-dark' : 'svg-img svg-bright'} />
        {/* needs a fallback value? */}
      </Button>
    </div>
  )
}