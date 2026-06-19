import { useState } from 'react';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
import snap from '@assets/snap.svg?react'
import exit from '@assets/exit.svg?react'
import { useSettingsStore } from '@hooks/useSettingsStore.hook.ts';
import SettingsButton from './composites/SettingsButton.tsx';
import Slider from '../../primitives/slider/Slider.tsx';
import SnapInput from './composites/SnapInput.tsx';
import SettingsPanelCss from './SettingsPanel.module.css'
export default function SettingsPanel() {

  const {
    update,
    settings
  } = useSettingsStore()

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)
  return (
    <div className={SettingsPanelCss.panel}>

      <SettingsButton
        id="close-settings"
        className={SettingsPanelCss.close}
        setValue={() => update("panelOpen", false)}
        ReactImg={exit}
      />
      <div className={SettingsPanelCss.row}>
        <SettingsButton
          id='lock-drag-item'
          value={settings.dragEnabled}
          setValue={() =>
            update("dragEnabled", !settings.dragEnabled)}
          msg={'Drag'}
          ReactImg={settings.dragEnabled ? unlocked : locked} />

        <SettingsButton
          id='snap'
          value={settings.snapEnabled}
          setValue={() =>
            update("snapEnabled", !settings.snapEnabled)}
          msg={'Snap'}
          ReactImg={snap} />

        <SettingsButton
          id='drag-grid'
          value={settings.gridVisible}
          setValue={() =>
            update("gridVisible", !settings.gridVisible)}
          msg={'Grid'}
          ReactImg={grid} />


        <SnapInput id="snapX" min={8} max={18} step={1} value={settings.dragSnapX} enabled={settings.snapEnabled} onChange={(v) => {
          update("dragSnapX", v)
        }} />

        <SnapInput id="snapY" min={16} max={36} step={2} value={settings.dragSnapY} enabled={settings.snapEnabled} onChange={(v) => {
          update("dragSnapY", v)
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