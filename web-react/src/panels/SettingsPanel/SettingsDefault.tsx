import Button from '@composites/Button/Button'
import { settingsStore } from '@stores/settings.store'
import { useState } from 'react'
import css from './SettingsPanel.module.css'
import SliderPrim from '@primitives/SliderPrim/SliderPrim'
import clsx from 'clsx'
import * as Icons from '@data/icons/';
import ButtonPair from '../../blocks/ButtonPair/ButtonPair'
import { useSnapInput } from './hooks/useSnapInput'

export default function SettingsDefault() {

  const update = settingsStore.getState().update

  const dragEnabled = settingsStore(s => s.settings.dragEnabled)
  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const gridVisible = settingsStore(s => s.settings.gridVisible)
  const dragSnapX = settingsStore(s => s.settings.dragSnapX)
  const dragSnapY = settingsStore(s => s.settings.dragSnapY)

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)

  const snapX = useSnapInput({
    value: dragSnapX,
    min: 8,
    max: 18,
    step: 1,
    enabled: snapEnabled,
    onChange: (v) => update("dragSnapX", v)
  })
  const snapY = useSnapInput({
    value: dragSnapY,
    min: 16,
    max: 36,
    step: 2,
    enabled: snapEnabled,
    onChange: (v) => update("dragSnapY", v)
  })

  return (

    <>
      <div>
        <Button
          onPressRelease={() => {
            update("settingsMode", 'layout')
          }}
          label={'Edit Layout'}
          Icon={Icons.gridNine}
          iconSettings={{ adjust: { rotate: 90 }, variant: "fill" }}
        />
      </div>

      <div className={clsx(css.row)}>
        <Button
          mode={dragEnabled}
          onPressRelease={() =>
            update("dragEnabled", !dragEnabled)}
          label={'Drag'}
          Icon={dragEnabled ? Icons.dragUnlocked : Icons.draglocked} />
        <Button
          mode={snapEnabled}
          onPressRelease={() =>
            update("snapEnabled", !snapEnabled)}
          label={'Snap'}
          Icon={Icons.snap} />
        <Button
          mode={gridVisible}
          onPressRelease={() =>
            update("gridVisible", !gridVisible)}
          label={'Grid'}
          Icon={Icons.gridNine}
          iconSettings={{ adjust: { rotate: 90 }, variant: "light", size: 44 }}
        />
      </div >

      <div className='settings-slider-frame'>
        <SliderPrim
          id='settings-slider-1'
          axis='horizontal'
          onValueChange={setSliderOne}
        >
        </SliderPrim>
        <span>snap X: {sliderOne}</span>
      </div>
      <div className='settings-slider-frame'>
        <SliderPrim
          id='settings-slider-2'
          axis='horizontal'
          onValueChange={setSliderTwo}
        >
        </SliderPrim>
        <span>snap Y {sliderTwo}</span>
      </div>

      <ButtonPair axis="vertical" label="snapX">
        <Button
          onPressRelease={snapX.increment}
          mode={snapX.canIncrement ? "default" : "disabled"}
          Icon={Icons.caretDown}
          iconSettings={{ adjust: { flipY: true } }}
          label={String(dragSnapX)}
        />
        <Button
          onPressRelease={snapX.decrement}
          mode={snapX.canDecrement ? "default" : "disabled"}
          Icon={Icons.caretDown}
        />
      </ButtonPair>
      <ButtonPair axis="horizontal" label="snapY">
        <Button
          onPressRelease={snapY.increment}
          mode={snapY.canIncrement ? "default" : "disabled"}
          Icon={Icons.caretDown}
          iconSettings={{ adjust: { flipY: true } }}
          label={String(dragSnapY)}
        />
        <Button
          onPressRelease={snapY.decrement}
          mode={snapY.canDecrement ? "default" : "disabled"}
          Icon={Icons.caretDown}
        />
      </ButtonPair>
    </>
  )
}