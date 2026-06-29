import { settingsStore } from '@stores/settings.store'
import css from './SettingsPanel.module.css'
import Button from '@composites/Button/Button'
import { alertStore } from '@stores/alert.store'
import { layoutStore } from '@stores/layout.store'
import { layout_DEFAULTS } from '@data/dataGenerator'
import clsx from 'clsx'
import { Icons } from '@data/icons/index'


export default function SettingsLayout() {
  const update = settingsStore.getState().update
  const override = layoutStore.getState().overrideToDefaults

  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)
  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const layoutMode = settingsStore(s => s.settings.layoutMode)

  return (
    <div className={clsx(css.panel)}>
      <Button
        isActive={layoutManagerH}
        onPressRelease={() => {
          update("layoutManagerH", !layoutManagerH)
          if (!layoutManagerH) update("layoutManagerV", false)
        }}
        label={"horizontal config"}
        Icon={layoutManagerH ? Icons.managerOnH : Icons.managerOffH}
      />

      <Button
        isActive={layoutManagerV}
        onPressRelease={() => {
          update("layoutManagerV", !layoutManagerV)
          if (!layoutManagerV) update("layoutManagerH", false)
        }}
        label={"vertical config"}
        Icon={layoutManagerV ? Icons.managerOnV : Icons.managerOffV}
      />
      <Button
        onPressRelease={() => {
          alertStore.getState().show({
            message: "Reset all layout settings?",
            onConfirm: () => override(layout_DEFAULTS),
            onCancel: () => console.log("Cancelled"),
          })
        }}
        label={"reset layout"}
        Icon={Icons.bomb}
      >
      </Button>

      <Button
        isActive={layoutMode === 'scenes'}
        onPressRelease={() => {
          update("layoutMode", "scenes")
        }}
        label={"scenes"}
      // Icon={""}
      />
      <Button
        isActive={layoutMode === 'lanes'}
        onPressRelease={() => {
          update("layoutMode", "lanes")
        }}
        label={"lanes"}
      // Icon={""}
      />
      <Button
        isActive={layoutMode === 'locks'}
        onPressRelease={() => {
          update("layoutMode", "locks")
        }}
        label={"locks"}
      // Icon={""}
      />

      <Button
        onPressRelease={() => update("settingsMode", "default")}
        label={"back"}
        Icon={Icons.backspace}
      />

    </div>
  )
}