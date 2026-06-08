import Button from '@primitives/button/Button'
import { useSettingsStore } from '@hooks/useSettingsStore.hook'


export default function Mid2() {
  const { isSettingsPanelOpen, setSettingsPanelOpen } = useSettingsStore()
  const setValue = () => {
    setSettingsPanelOpen(!isSettingsPanelOpen)
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