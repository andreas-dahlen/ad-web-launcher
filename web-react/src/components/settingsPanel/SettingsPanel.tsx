import { useState } from 'react';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
import snap from '@assets/snap.svg?react'
import { useSettingsStore } from '../../hooks/useSettings.js';
import SettingsButton from './SettingsButton.tsx';
import Slider from '@slider/Slider.tsx';
import SnapInput from '@components/settingsPanel/SnapInput.tsx';

export default function SettingsPanel() {

  const {
    dragEnabled,
    setDragEnabled,
    gridEnabled,
    setGridEnabled,
    setDragSnapX,
    setDragSnapY,
    dragSnapX,
    dragSnapY,
    snapEnabled,
    setSnapEnabled } = useSettingsStore()

  const handleGridEnabling = () => {
    if (!gridEnabled) {
      setGridEnabled(true)
      setTimeout(() => { setGridEnabled(false) }, 2000)
    }
  }

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)

  return (
    <div className='settings-panel'>
      <div className='settings-row'>
        <SettingsButton
          id='lock-drag-item'
          value={dragEnabled}
          setValue={() => setDragEnabled(!dragEnabled)}
          msg={'Drag'}
          ReactImg={dragEnabled ? unlocked : locked}>
        </SettingsButton>
        <SettingsButton
          id='drag-grid'
          value={gridEnabled}
          setValue={() => setGridEnabled(!gridEnabled)}
          msg={'Grid'}
          ReactImg={grid}>
        </SettingsButton>
        <SettingsButton
          id='snap'
          value={snapEnabled}
          setValue={() => setSnapEnabled(!snapEnabled)}
          msg={'Snap'}
          ReactImg={snap}>

        </SettingsButton>


        <SnapInput id="snapX" min={8} max={18} step={1} value={dragSnapX} onChange={(v) => {
          setDragSnapX(v)
          handleGridEnabling()
        }} />

        <SnapInput id="snapY" min={16} max={36} step={2} value={dragSnapY} onChange={(v) => {
          setDragSnapY(v)
          handleGridEnabling()
        }} />
      </div >



      <div className='settings-slider-frame'>
        <Slider
          id='settings-slider-1'
          axis='horizontal'
          onValueChange={setSliderOne}
        >

          {/* <div></div> */}
        </Slider>
        <span>snap X: {sliderOne}</span>
      </div>
      <div className='settings-slider-frame'>
        <Slider
          id='settings-slider-2'
          axis='horizontal'
          onValueChange={setSliderTwo}
        >

          {/* <div></div> */}
        </Slider>
        <span>snap Y {sliderTwo}</span>
      </div>

    </div>

  )
}