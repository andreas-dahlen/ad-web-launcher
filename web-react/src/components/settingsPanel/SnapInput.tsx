import Button from '@components/primitives/button/Button'
import { useState } from 'react'


interface SnapInput {
  value: number
  min: number
  max: number
  step: number
  id: string
  onChange: (value: number) => void
}

export default function SnapInput(pr: SnapInput) {


  const [lessEnabled, setLessEnabled] = useState(pr.value > pr.min)
  const [moreEnabled, setMoreEnabled] = useState(pr.value < pr.max)

  const handleChange = (more: boolean) => {
    const result = more
      ? Math.min(pr.max, pr.value + pr.step)
      : Math.max(pr.min, pr.value - pr.step)

    setMoreEnabled(pr.max !== result)
    setLessEnabled(pr.min !== result)
    pr.onChange(result)
  }

  return (
    <div className="snap-panel">
      <span>{pr.value - 2}</span>
      {/* // exclude off-screen boundary lines */}
      <div className='snap-button-wrapper'>
        <Button className={'settings-button'} id={`more-${pr.id}`}
          onPressRelease={() => handleChange(true)}
          data-enabled={moreEnabled ? 'true' : 'false'}
          interactive={moreEnabled}
        >▲</Button>

        <Button className={'settings-button'} id={`less-${pr.id}`}
          onPressRelease={() => handleChange(false)}
          data-enabled={lessEnabled ? 'true' : 'false'}
          interactive={lessEnabled}
        >▼</Button>
      </div>
    </div>
  )
}