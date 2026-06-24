import { useState } from 'react';
import Bomb from '@assets/bomb.svg?react'
import managerH from '@assets/horizontalmanager.svg?react'
import managerInactiveH from '@assets/horizontalmanagerinactive.svg?react'
import managerV from '@assets/verticalmanager.svg?react'
import managerInactiveV from '@assets/verticalmanagerinactive.svg?react'
import dragUnlocked from '@assets/dragunlocked.svg?react'
import dragLocked from '@assets/draglocked.svg?react'
import grid from '@assets/grid.svg?react'
import snap from '@assets/snap.svg?react'
import exit from '@assets/exit.svg?react'
import SettingsButton from '../composites/structural/SettingsButton.tsx';
import Slider from '../primitives/Slider/Slider.tsx';
import SnapInput from '../composites/structural/SnapInput.tsx';
import Button from '@primitives/Button/Button.tsx';
import css from './SettingsPanel.module.css'
import { layout_DEFAULTS } from '@data/dataGenerator.ts';
import clsx from 'clsx';
import { alertStore } from '@stores/alert.store.ts';
import { settingsStore } from '@stores/settings.store.ts';
import { layoutStore } from '@stores/layout.store.ts';
import { PanelBase } from '@composites/controls/PanelBase/PanelBase.tsx';
export default function SettingsPanel() {

  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)
  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)
  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const gridVisible = settingsStore(s => s.settings.gridVisible)
  const dragSnapX = settingsStore(s => s.settings.dragSnapX)
  const dragSnapY = settingsStore(s => s.settings.dragSnapY)

  const update = settingsStore.getState().update

  const override = layoutStore.getState().overrideToDefaults

  const [sliderOne, setSliderOne] = useState(0)
  const [sliderTwo, setSliderTwo] = useState(0)
  return (
    <PanelBase className={css.settingsPanel}>

      <SettingsButton
        id="close-settings"
        className={css.close}
        setValue={() => update("panelOpen", false)}
        ReactImg={exit}
      />
      <div className={css.row}>
        <SettingsButton
          id='enableManagerhorizontal'
          value={layoutManagerH}
          setValue={() => {
            update("layoutManagerH", !layoutManagerH)
            if (!layoutManagerH) update("layoutManagerV", false)
          }}
          msg={"horizontal config - woopee"}
          ReactImg={layoutManagerH ? managerH : managerInactiveH}
        />

        <SettingsButton
          id='enableManagervertical'
          value={layoutManagerV}
          setValue={() => {
            update("layoutManagerV", !layoutManagerV)
            if (!layoutManagerV) update("layoutManagerH", false)
          }}
          msg={"vertical config"}
          ReactImg={layoutManagerV ? managerV : managerInactiveV}
        />
        <Button
          id="override"
          onPressRelease={() => {
            alertStore.getState().show({
              message: "Reset all layout settings?",
              onConfirm: () => override(layout_DEFAULTS),
              onCancel: () => console.log("Cancelled"),
            })
          }}
        >
          <Bomb className={clsx(css.svg, css.red)} />
        </Button>

      </div>


      <div className={css.row}>
        <SettingsButton
          id='lock-drag-item'
          value={dragEnabled}
          setValue={() =>
            update("dragEnabled", !dragEnabled)}
          msg={'Drag'}
          ReactImg={dragEnabled ? dragUnlocked : dragLocked} />

        <SettingsButton
          id='snap'
          value={snapEnabled}
          setValue={() =>
            update("snapEnabled", !snapEnabled)}
          msg={'Snap'}
          ReactImg={snap} />

        <SettingsButton
          id='drag-grid'
          value={gridVisible}
          setValue={() =>
            update("gridVisible", !gridVisible)}
          msg={'Grid'}
          ReactImg={grid} />


        <SnapInput id="snapX" min={8} max={18} step={1} value={dragSnapX} enabled={snapEnabled} onChange={(v) => {
          update("dragSnapX", v)
        }} />

        <SnapInput id="snapY" min={16} max={36} step={2} value={dragSnapY} enabled={snapEnabled} onChange={(v) => {
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

    </PanelBase>

  )
}