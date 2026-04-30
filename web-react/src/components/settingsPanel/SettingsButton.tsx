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
        data-active={value ? 'true' : 'false'}
        data-enabled={enabled ? 'true' : 'false'}
        onPressRelease={setValue}
        data-state={'released'}
        interactive={enabled}
      >
        <ReactImg className={value ?
          'svg-img svg-dark' : 'svg-img svg-bright'} />
        {/* needs a fallback value? */}
      </Button>
    </div>
  )
}