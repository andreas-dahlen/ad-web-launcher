import { useState } from 'react';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
import snap from '@assets/snap.svg?react'
import { useSettingsStore } from '../../../hooks/useSettingsStore.js';
import SettingsButton from './SettingsButton.tsx';
import Slider from '@slider/Slider.tsx';
import SnapInput from '@components/features/settingsPanel/SnapInput.tsx';

export default function SettingsPanel() {

  const {
    isLayoutEditMode,
    setLayoutEditMode,
    isGridEnabled,
    setGridEnabled,
    dragSnapX,
    setDragSnapX,
    dragSnapY,
    setDragSnapY,
    isSnapEnabled,
    setSnapEnabled
  } = useSettingsStore()

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)
  return (
    <div className='settings-panel'>
      <div className='settings-row'>
        <SettingsButton
          id='lock-drag-item'
          value={isLayoutEditMode}
          setValue={() => setLayoutEditMode(!isLayoutEditMode)}
          msg={'Drag'}
          enabled={true}
          ReactImg={isLayoutEditMode ? unlocked : locked}>
        </SettingsButton>
        <SettingsButton
          id='snap'
          value={isSnapEnabled}
          enabled={true}
          setValue={() => {
            setSnapEnabled(!isSnapEnabled)
          }
          }
          msg={'Snap'}
          ReactImg={snap}>

        </SettingsButton>
        <SettingsButton
          id='drag-grid'
          value={isGridEnabled}
          enabled={true}
          setValue={() => setGridEnabled(!isGridEnabled)}
          msg={'Grid'}
          ReactImg={grid}>
        </SettingsButton>


        <SnapInput id="snapX" min={8} max={18} step={1} value={dragSnapX} enabled={isSnapEnabled} onChange={(v) => {
          setDragSnapX(v)
          // handleGridEnabling()
        }} />

        <SnapInput id="snapY" min={16} max={36} step={2} value={dragSnapY} enabled={isSnapEnabled} onChange={(v) => {
          setDragSnapY(v)
          // handleGridEnabling()
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