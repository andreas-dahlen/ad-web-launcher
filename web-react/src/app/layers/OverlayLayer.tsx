import SettingsPanel from '@components/SettingsPanel.jsx';
import { useSettingsEnabled } from '@config/settingsHooks/useSettingsEnabled';


export default function OverlayLayer() {

  const { settingsEnabled } = useSettingsEnabled()
  return (

    settingsEnabled ? <SettingsPanel /> : ''
  )
}