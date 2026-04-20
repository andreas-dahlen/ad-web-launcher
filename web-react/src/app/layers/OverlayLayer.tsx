import DragGrid from '@components/settingsPanel/DragGrid';
import SettingsPanel from '@components/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '@config/settingsHooks/useSettings';


export default function OverlayLayer() {

  const { settingsEnabled, gridEnabled } = useSettingsStore()
  return (
    <>
      {gridEnabled ? <DragGrid /> : ''}
      {settingsEnabled ? <SettingsPanel /> : ''}
    </>
  )
}