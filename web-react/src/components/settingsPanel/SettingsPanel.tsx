import { useState } from 'react';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
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
    dragSnapY } = useSettingsStore()

  const setLock = () => {
    setDragEnabled(!dragEnabled)
  }
  const setGrid = () => {
    setGridEnabled(!gridEnabled)
  }

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)

  return (
    <>
      <div className='settings-panel'>
        <div className='settings-row'>
          <SettingsButton
            id='lock-drag-item'
            value={dragEnabled}
            setValue={setLock}
            label={dragEnabled ? 'drag unlocked' : 'drag locked'}
            ReactImg={dragEnabled ? unlocked : locked}>
          </SettingsButton>
          <SettingsButton
            id='drag-grid'
            value={gridEnabled}
            setValue={setGrid}
            label={gridEnabled ? 'grid enabled' : 'grid disabled'}
            ReactImg={grid}>
          </SettingsButton>
        </div >
        <SnapInput id="snapX" min={8} max={18} step={1} value={dragSnapX} onChange={setDragSnapX}></SnapInput>

        <SnapInput id="snapY" min={16} max={36} step={2} value={dragSnapY} onChange={setDragSnapY}></SnapInput>
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

    </>
  )
}