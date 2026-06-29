import exit from '@assets/exit.svg?react'
import css from './SettingsPanel.module.css'
import { settingsStore } from '@stores/settings.store.ts';
import { PanelBase } from '../../blocks/Panel/PanelBase.tsx';
import SettingsDefault from './SettingsDefault.tsx';
import SettingsLayout from './SettingsLayout.tsx';
import Button from '@composites/Button/Button.tsx';
import clsx from 'clsx';
export default function SettingsPanel() {

  const update = settingsStore.getState().update

  const settingsmode = settingsStore(s => s.settings.settingsMode)

  return (
    <PanelBase className={clsx(css.settingsPanel)}>

      <Button
        className={css.close}
        onPressRelease={() => update("panelOpen", false)}
        Icon={exit}
      />

      {settingsmode === "default" && <SettingsDefault />}
      {settingsmode === "layout" && <SettingsLayout />}

    </PanelBase>
  )
}