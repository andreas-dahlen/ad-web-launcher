import Button from '@composites/Button/Button'
import { settingsStore } from '@stores/settings.store'
import { useState } from 'react'
import SliderPrim from '@primitives/Slider/SliderPrim'
import * as Icons from '@data/icons';
import ButtonPair from '../../blocks/ButtonPair/ButtonPair'
import { useSnapInput } from './hooks/useSnapInput'
import Frame from '@composites/Frame/Frame'

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
      <Frame>
        <Button
          button={{
            onPressRelease: () => {
              update("settingsMode", 'layout')
            }
          }}
          label={{ msg: 'Edit Layout' }}
          icon={{
            Svg: Icons.gridNine,
            variant: "fill",
            styleVars: {
              rotate: "rotate(90deg)",
              modeOnCol: "m:modeDisabledCol"
            }
            // settings: { adjust: { rotate: 90 }, variant: "fill" }
          }}
        />
      </Frame>

      <Frame
        layout={{ presets: ["row"] }}
      >
        <Button
          directive={{ mode: dragEnabled }}
          button={{
            onPressRelease: () =>
              update("dragEnabled", !dragEnabled)
          }}
          label={{ msg: 'Drag' }}
          icon={{ Svg: dragEnabled ? Icons.dragUnlocked : Icons.draglocked }} />
        <Button
          directive={{ mode: snapEnabled }}
          button={{
            onPressRelease: () =>
              update("snapEnabled", !snapEnabled)
          }}
          label={{ msg: 'Snap' }}
          icon={{ Svg: Icons.snap }} />
        <Button
          directive={{ mode: gridVisible }}
          button={{
            onPressRelease: () =>
              update("gridVisible", !gridVisible)
          }}
          label={{ msg: 'Grid' }}
          icon={{
            Svg: Icons.gridNine,
            variant: "light",
            phosphorSize: 40,
            styleVars: {
              rotate: "rotate(90deg)",
            }
          }}
        />
        <ButtonPair axis="vertical" middle={dragSnapX}>
          <Button
            directive={{ mode: snapEnabled ? "default" : "disabled", interactive: snapX.canIncrement }}
            button={{
              onPressRelease: snapX.increment,
              styleVars: { width: "40px", height: "40px" }
            }}
            icon={{
              Svg: Icons.caretDown,
              phosphorSize: 30,
              styleVars: { flipY: "scaleY(-1)" }
            }}
          />
          <Button
            directive={{ mode: snapEnabled ? "default" : "disabled", interactive: snapX.canDecrement }}
            button={{
              onPressRelease: snapX.decrement,
              styleVars: { width: "40px", height: "40px" }
            }}
            icon={{
              Svg: Icons.caretDown,
              phosphorSize: 30
            }}
          />
        </ButtonPair>

        <ButtonPair axis="vertical" middle={dragSnapY}>
          <Button
            directive={{ mode: snapEnabled ? "default" : "disabled", interactive: snapY.canIncrement }}
            button={{
              onPressRelease: snapY.increment,
              styleVars: { width: "40px", height: "40px" }
            }}
            icon={{
              Svg: Icons.caretDown,
              phosphorSize: 30,
              styleVars: { flipY: "ScaleY(-1)" }
            }}
          />
          <Button
            directive={{ mode: snapEnabled ? "default" : "disabled", interactive: snapY.canDecrement }}
            button={{
              onPressRelease: snapY.decrement,
              styleVars: { width: "40px", height: "40px" }
            }}
            icon={{
              Svg: Icons.caretDown,
              phosphorSize: 30
            }}
          />
        </ButtonPair>
      </Frame >

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

    </>
  )
}