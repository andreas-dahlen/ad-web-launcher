import Button from '@primitives/button/Button';
import { useSettingsStore } from '@hooks/useSettingsStore';


export default function Bottom3() {

  const { isSettingsPanelOpen, setSettingsPanelOpen } = useSettingsStore()
  const setValue = () => {
    setSettingsPanelOpen(!isSettingsPanelOpen)
  }

  return (
    <div>
      <Button
        id="open-settings"
        onPressRelease={setValue}
        className='settings-on-off-button'
      />
    </div>
  )
}