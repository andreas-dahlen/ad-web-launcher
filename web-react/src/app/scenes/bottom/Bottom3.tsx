import Button from '@primitives/button/Button';
import { useSettingsStore } from '@hooks/useSettingsStore.hook';


export default function Bottom3() {

  const { update, settings } = useSettingsStore()
  const setValue = () => {
    update("panelOpen", !settings.panelOpen)
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