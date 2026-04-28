import DragGrid from '@components/settingsPanel/DragGrid';
import SettingsPanel from '@components/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '../../hooks/useSettings';


export default function OverlayLayer() {

  const { settingsOverlayEnabled, gridEnabled } = useSettingsStore()
  return (
    <>
      {gridEnabled ? <DragGrid /> : ''}
      {settingsOverlayEnabled ? <SettingsPanel /> : ''}
    </>
  )
}