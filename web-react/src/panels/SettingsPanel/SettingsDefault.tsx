import Button from '@composites/Button/Button'
import { settingsStore } from '@stores/settings.store'
import { useState } from 'react'
import css from './SettingsPanel.module.css'
import dragUnlocked from '@assets/dragunlocked.svg?react'
import dragLocked from '@assets/draglocked.svg?react'
import snap from '@assets/snap.svg?react'
import grid from '@assets/grid.svg?react'
import SnapInput from '@composites/structural/SnapInput'
import SliderPrim from '@primitives/SliderPrim/SliderPrim'

export default function SettingsDefault() {

  const update = settingsStore.getState().update

  const dragEnabled = settingsStore(s => s.settings.dragEnabled)
  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const gridVisible = settingsStore(s => s.settings.gridVisible)
  const dragSnapX = settingsStore(s => s.settings.dragSnapX)
  const dragSnapY = settingsStore(s => s.settings.dragSnapY)

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)
  return (

    <>
      <div className={css.row}>
        <Button
          isActive={dragEnabled}
          onPressRelease={() =>
            update("dragEnabled", !dragEnabled)}
          label={'Drag'}
          Icon={dragEnabled ? dragUnlocked : dragLocked} />

        <Button
          isActive={snapEnabled}
          onPressRelease={() =>
            update("snapEnabled", !snapEnabled)}
          label={'Snap'}
          Icon={snap} />

        <Button
          isActive={gridVisible}
          onPressRelease={() =>
            update("gridVisible", !gridVisible)}
          label={'Grid'}
          Icon={grid} />


        <SnapInput id="snapX" min={8} max={18} step={1} value={dragSnapX} enabled={snapEnabled} onChange={(v) => {
          update("dragSnapX", v)
        }} />

        <SnapInput id="snapY" min={16} max={36} step={2} value={dragSnapY} enabled={snapEnabled} onChange={(v) => {
          update("dragSnapY", v)
        }} />
      </div >

      <div className='settings-slider-frame'>
        <SliderPrim
          id='settings-slider-1'
          axis='horizontal'
          onValueChange={setSliderOne}
        >

          {/* <div></div> */}
        </SliderPrim>
        <span>snap X: {sliderOne}</span>
      </div>
      <div className='settings-slider-frame'>
        <SliderPrim
          id='settings-slider-2'
          axis='horizontal'
          onValueChange={setSliderTwo}
        >

          {/* <div></div> */}
        </SliderPrim>
        <span>snap Y {sliderTwo}</span>
      </div>
    </>
  )
}