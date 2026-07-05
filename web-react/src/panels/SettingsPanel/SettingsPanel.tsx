import css from './SettingsPanel.module.css'
import { settingsStore } from '@stores/settings.store.ts';
import Frame from '@composites/Frame/Frame.tsx';
import SettingsDefault from './SettingsDefault.tsx';
import SettingsLayout from './SettingsLayout.tsx';
import Button from '@composites/Button/Button.tsx';
import * as Icons from '@data/icons/';
export default function SettingsPanel() {

  const update = settingsStore.getState().update

  const settingsmode = settingsStore(s => s.settings.settingsMode)

  return (
    <Frame
      presets={["bg", "frame"]}
    >

      <Button
        button={{
          presets: ["close"],
          onPressRelease: () => update("panelOpen", false)
        }}
        icon={{ Svg: Icons.exit }}
      />

      {settingsmode === "default" && <SettingsDefault />}
      {settingsmode === "layout" && <SettingsLayout />}

    </Frame>
  )
}