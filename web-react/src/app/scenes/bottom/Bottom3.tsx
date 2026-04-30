import Button from '@components/primitives/button/Button';
import { useSettingsStore } from '../../../hooks/useSettings';


export default function Bottom3() {

  const { settingsOverlayEnabled, setSettingsEnabled } = useSettingsStore()
  const setValue = () => {
    setSettingsEnabled(!settingsOverlayEnabled)
  }

  // console.log(settingsEnabled)

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