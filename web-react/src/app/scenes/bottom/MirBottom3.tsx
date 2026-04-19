import Button from '@components/primitives/button/Button';
import { useSettingsEnabled } from '@config/settingsHooks/useSettingsEnabled';


export default function MirBottom3() {

  const { settingsEnabled, setSettingsEnabled } = useSettingsEnabled()
  const setValue = () => {
    setSettingsEnabled(!settingsEnabled)
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