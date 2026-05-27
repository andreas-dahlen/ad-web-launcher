import SettingsPanel from '@components/features/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '../../hooks/useSettingsStore';
import { Z } from '@config/zIndex';
import Scroll from '@components/primitives/scroll/Scroll';

/** LAYER 3/3! */
export default function OverlayLayer() {

  const { isSettingsPanelOpen } = useSettingsStore()
  return (
    <>
      <div className='layer' style={{ zIndex: Z.overlay }}>
        {isSettingsPanelOpen ? <SettingsPanel /> : ''}


        <Scroll
          id='testing-scroll'
          axis='vertical'
          onEdgeDir='up'
        >
          <div className='test-frame'></div>

        </Scroll>

      </div>


    </>


  )
}