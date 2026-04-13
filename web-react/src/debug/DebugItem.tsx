import Button from '@components/primitives/button/Button';

type DebugItemProps = {
  id: string
  value: boolean
  setValue: () => void
  label?: string
  ReactImg: React.FC<React.SVGProps<SVGSVGElement>>
}

export default function DebugItem({
  id,
  value,
  setValue,
  ReactImg,
  label }: DebugItemProps
) {

  return (
    <div className='debug-item'>

      <label htmlFor={id}>{label} </label>
      <Button
        id={id}
        className='debug-button'
        data-state={value ? 'state-on' : 'state-off'}
        onPressRelease={setValue}
        data-pressed={'released'}
      >
        <ReactImg className={value ?
          'svg-img svg-dark' : 'svg-img svg-bright'} />
      </Button>
    </div>
  )
}