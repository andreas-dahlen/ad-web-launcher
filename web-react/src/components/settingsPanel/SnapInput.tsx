import Button from '@components/primitives/button/Button'


interface SnapInput {
  value: number
  min: number
  max: number
  step: number
  id: string
  onChange: (value: number) => void
}



export default function SnapInput({ value, min, max, onChange, step, id }: SnapInput) {

  return (
    <div className="snap-input">
      <Button id={`less-${id}`} onPressRelease={() => onChange(Math.max(min, value - step))}>▼</Button>
      <span>{value}</span>
      <Button id={`more-${id}`} onPressRelease={() => onChange(Math.min(max, value + step))}>▲</Button>
    </div>
  )
}