import { useDragEnabled } from '@config/settingsHooks/useDragEnabled';
import { useGridEnabled } from '@config/settingsHooks/useGridEnabled';
import SettingsButton from './SettingsButton.jsx';
import Slider from '@slider/Slider.tsx';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
import { useState } from 'react';

export default function SettingsPanel() {

  const { dragEnabled, setDragEnabled } = useDragEnabled()
  const setLock = () => {
    setDragEnabled(!dragEnabled)
  }
  const { gridEnabled, setGridEnabled } = useGridEnabled()
  const setGrid = () => {
    setGridEnabled(!gridEnabled)
  }

  const [snapY, setSnapY] = useState(0)
  const [snapX, setSnapX] = useState(0)

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
        <div className='settings-slider-frame'>
          <Slider
            id='snapX-slider'
            axis='horizontal'
            onValueChange={setSnapX}
          >

            {/* <div></div> */}
          </Slider>
          <label>snap X: {snapX}</label>
        </div>
        <div className='settings-slider-frame'>
          <Slider
            id='snapY-slider'
            axis='horizontal'
            onValueChange={setSnapY}
          >

            {/* <div></div> */}
          </Slider>
          <label>snap Y {snapY}</label>
        </div>
      </div>
      {/* // </div > */}

    </>
  )
}