import Button from '@primitives/button/Button'
import { useState } from 'react'
import css from './Composites.module.css'

interface SnapInput {
  value: number
  min: number
  max: number
  step: number
  id: string
  enabled: boolean
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
    <div className={css.panel}>
      <span>{pr.value}</span>
      <div className={css.wrapper}>
        <Button className={css.button} id={`more-${pr.id}`}
          onPressRelease={() => handleChange(true)}
          buttonDataAttrs={{ 'enabled': moreEnabled }}
          interactive={moreEnabled}
        >▲</Button>

        <Button className={css.button} id={`less-${pr.id}`}
          onPressRelease={() => handleChange(false)}
          buttonDataAttrs={{ 'enabled': lessEnabled }}
          interactive={lessEnabled}
        >▼</Button>
      </div>
    </div>
  )
}