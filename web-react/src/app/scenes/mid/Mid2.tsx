import Button from '@primitives/button/Button'
import { useSettingsStore } from '@hooks/useSettingsStore.hook'


export default function Mid2() {
  const { settings, update } = useSettingsStore()
  const setValue = () => {
    update("panelOpen", !settings.panelOpen)
  }

  return (
    <div>
      <Button
        id="open-settings-mid"
        onPressRelease={setValue}
      >

      </Button>

    </div>
  )
}