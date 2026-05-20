import SettingsPanel from '@components/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '../../hooks/useSettingsStore';
import { Z } from '@config/zIndex';

/** LAYER 4/4! Horizontal swipes. doesn't contain content! */
export default function OverlayLayer() {

  const { settingsOverlayEnabled } = useSettingsStore()
  return (
    <div className='layer' style={{ zIndex: Z.overlay }}>
      {settingsOverlayEnabled ? <SettingsPanel /> : ''}
    </div>
  )
}