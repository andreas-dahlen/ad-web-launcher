import SettingsPanel from '../../features/settingsPanel/SettingsPanel.js';
import { useSettingsStore } from '@hooks//useSettingsStore.js';
import { Z } from '@config/zIndex';
import Scroll from '../../primitives/scroll/Scroll.js';
import layerCss from './Layers.module.css'
/** LAYER 3/3! */
export default function OverlayLayer() {

  const { isSettingsPanelOpen } = useSettingsStore()
  return (
    <>
      <div className={layerCss.layer} style={{ zIndex: Z.overlay }}>
        {isSettingsPanelOpen ? <SettingsPanel /> : ''}


        <Scroll
          id='testing-scroll'
          axis='vertical'
          onEdgeDir='up'
          isInitialVisible={false}
        >
          <div className='test-frame'></div>

        </Scroll>

      </div>


    </>


  )
}