import SettingsPanel from '@components/features/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '../../hooks/useSettingsStore';
import { Z } from '@config/zIndex';

/** LAYER 3/3! */
export default function OverlayLayer() {

  const { isSettingsPanelOpen } = useSettingsStore()
  return (
    <div className='layer' style={{ zIndex: Z.overlay }}>
      {isSettingsPanelOpen ? <SettingsPanel /> : ''}
    </div>
  )
}