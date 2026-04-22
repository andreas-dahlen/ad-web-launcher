import Button from '@components/primitives/button/Button';
import { useSettingsStore } from '@config/settingsHooks/useSettings';


export default function MirBottom3() {

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

      />
    </div>
  )
}