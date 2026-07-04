import { settingsStore } from '@stores/settings.store'
import css from './SettingsPanel.module.css'
import Button from '@composites/Button/Button'
import { alertStore } from '@stores/alert.store'
import { layoutStore } from '@stores/layout.store'
import { layout_DEFAULTS } from '@data/dataGenerator'
import clsx from 'clsx'
import * as Icons from '@data/icons/';
import Frame from '@composites/Frame/Frame'
import Label from '../../blocks/Label/Label'


export default function SettingsLayout() {
  const update = settingsStore.getState().update
  const override = layoutStore.getState().overrideToDefaults

  const layoutManagerH = settingsStore(s => s.settings.layoutManagerH)
  const layoutManagerV = settingsStore(s => s.settings.layoutManagerV)
  const layoutMode = settingsStore(s => s.settings.layoutMode)

  return (
    <>
      <Label
        msg={"editing"}
        el={"h1"}
        position={"center"}
        styleVars={{ position: "relative" }} />
      <Frame presets={["row"]}>
        <Button
          directive={{ mode: layoutManagerH }}
          button={{
            onPressRelease: () => {
              update("layoutManagerH", !layoutManagerH)
              if (!layoutManagerH) update("layoutManagerV", false)
            }
          }}
          label={{ msg: "horizontal config" }}
          icon={{ Svg: layoutManagerH ? Icons.onManagerH : Icons.offManagerH }}
        />

        <Button
          directive={{ mode: layoutManagerV }}
          button={{
            onPressRelease: () => {
              update("layoutManagerV", !layoutManagerV)
              if (!layoutManagerV) update("layoutManagerH", false)
            }
          }}
          label={{ msg: "vertical config" }}
          icon={{ Svg: layoutManagerV ? Icons.onManagerV : Icons.offManagerV }}
        />

        <Button
          button={{
            onPressRelease: () => {
              alertStore.getState().show({
                message: "Reset all layout settings?",
                onConfirm: () => override(layout_DEFAULTS),
                onCancel: () => console.log("Cancelled"),
              })
            }
          }}
          label={{ msg: "reset layout" }}
          icon={{ Svg: Icons.bomb }}
        />

      </Frame>
      <Button
        directive={{ mode: layoutMode === 'scenes' }}
        button={{
          onPressRelease: () => {
            update("layoutMode", "scenes")
          }
        }}
        label={{ msg: "scenes" }}
      // Icon={""}
      />
      <Button
        directive={{ mode: layoutMode === 'lanes' }}
        button={{
          onPressRelease: () => {
            update("layoutMode", "lanes")
          }
        }}
        label={{ msg: "lanes" }}
      // Icon={""}
      />
      <Button
        directive={{ mode: layoutMode === 'locks' }}
        button={{
          onPressRelease: () => {
            update("layoutMode", "locks")
          }
        }}
        label={{ msg: "locks" }}
      // Icon={""}
      />

      <Button
        button={{
          onPressRelease: () => update("settingsMode", "default")
        }}
        label={{ msg: "back" }}
        icon={{ Svg: Icons.backspace }}
      />

    </>
  )
}