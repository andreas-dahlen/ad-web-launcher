import Button from '@composites/Button/Button'
import { settingsStore } from '@stores/settings.store'
import { useState } from 'react'
import css from './SettingsPanel.module.css'
import SliderPrim from '@primitives/SliderPrim/SliderPrim'
import clsx from 'clsx'
import * as Icons from '@data/icons/';
import ButtonPair from '../../blocks/ButtonPair/ButtonPair'
import { useSnapInput } from './hooks/useSnapInput'
import Label from '../../blocks/Label/Label'

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
          button={{
            onPressRelease: () => {
              update("settingsMode", 'layout')
            }
          }}
          label={{ msg: 'Edit Layout' }}
          icon={{
            Svg: Icons.gridNine,
            settings: { adjust: { rotate: 90 }, variant: "fill" }
          }}
        />
      </div>

      <div className={clsx(css.row)}>
        <Button
          mode={dragEnabled}
          button={{
            onPressRelease: () =>
              update("dragEnabled", !dragEnabled)
          }}
          label={{ msg: 'Drag' }}
          icon={{ Svg: dragEnabled ? Icons.dragUnlocked : Icons.draglocked }} />
        <Button
          mode={snapEnabled}
          button={{
            onPressRelease: () =>
              update("snapEnabled", !snapEnabled)
          }}
          label={{ msg: 'Snap' }}
          icon={{ Svg: Icons.snap }} />
        <Button
          mode={gridVisible}
          button={{
            onPressRelease: () =>
              update("gridVisible", !gridVisible)
          }}
          label={{ msg: 'Grid' }}
          icon={{
            Svg: Icons.gridNine,
            settings: { adjust: { rotate: 90 }, variant: "light", size: 44 }
          }}
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

      <Label msg="Snap X" position='top'>
        <ButtonPair axis="vertical" middle={dragSnapX}>
          <Button
            mode={snapX.canIncrement ? "default" : "disabled"}
            button={{
              onPressRelease: snapX.increment,
              styleVars: { border: "10px solid black" }
            }}
            icon={{
              Svg: Icons.caretDown,
              settings: { adjust: { flipY: true }, size: 30 }
            }}
          />
          <Button
            mode={snapX.canDecrement ? "default" : "disabled"}
            button={{ onPressRelease: snapX.decrement }}
            icon={{ Svg: Icons.caretDown }}
          />
        </ButtonPair>
      </Label>

      <Label msg="Snap Y" position='top'>
        <ButtonPair axis="horizontal" middle={dragSnapY}>
          <Button
            mode={snapY.canIncrement ? "default" : "disabled"}
            button={{ onPressRelease: snapY.increment }}
            icon={{
              Svg: Icons.caretDown,
              settings: { adjust: { flipY: true } }
            }}
          />
          <Button
            mode={snapY.canDecrement ? "default" : "disabled"}
            button={{ onPressRelease: snapY.decrement }}
            icon={{ Svg: Icons.caretDown }}
          />
        </ButtonPair>
      </Label>
    </>
  )
}