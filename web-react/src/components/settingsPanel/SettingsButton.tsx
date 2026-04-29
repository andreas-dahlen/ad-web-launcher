import Button from '@components/primitives/button/Button';

type DebugItemProps = {
  id: string
  value: boolean
  setValue: () => void
  msg?: string
  ReactImg: React.FC<React.SVGProps<SVGSVGElement>>
}

export default function DebugItem({
  id,
  value,
  setValue,
  ReactImg,
  msg }: DebugItemProps
) {

  return (
    <div className='settings-item'>

      <span>{msg}</span>
      <Button
        id={id}
        className='settings-button'
        data-active={value ? 'true' : 'false'}
        onPressRelease={setValue}
        data-state={'released'}
      >
        <ReactImg className={value ?
          'svg-img svg-dark' : 'svg-img svg-bright'} />
        {/* needs a fallback value? */}
      </Button>
    </div>
  )
}