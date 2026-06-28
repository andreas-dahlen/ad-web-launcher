import { settingsStore } from '@stores/settings.store'
import css from './SettingsPanel.module.css'
import Button from '@composites/Button/Button'
import managerH from '@assets/horizontalmanager.svg?react'
import managerInactiveH from '@assets/horizontalmanagerinactive.svg?react'
import managerV from '@assets/horizontalmanager.svg?react'
import managerInactiveV from '@assets/verticalmanagerinactive.svg?react'
import bomb from '@assets/bomb.svg?react'
import { alertStore } from '@stores/alert.store'
import { layoutStore } from '@stores/layout.store'
import { layout_DEFAULTS } from '@data/dataGenerator'


export default function SettingsLayout() {
  const update = settingsStore.getState().update

  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)
  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const override = layoutStore(s => s.overrideToDefaults)

  return (
    <div className={css.panel}>
      <Button
        isActive={layoutManagerH}
        layoutClass={css.layoutClass}
        onPressRelease={() => {
          update("layoutManagerH", !layoutManagerH)
          if (!layoutManagerH) update("layoutManagerV", false)
        }}
        label={"horizontal config"}
        Icon={layoutManagerH ? managerH : managerInactiveH}
      />

      <Button
        isActive={layoutManagerV}
        onPressRelease={() => {
          update("layoutManagerV", !layoutManagerV)
          if (!layoutManagerV) update("layoutManagerH", false)
        }}
        label={"vertical config"}
        Icon={layoutManagerV ? managerV : managerInactiveV}
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
        Icon={bomb}
      >
      </Button>

    </div>
  )
}