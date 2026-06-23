import SettingsPanel from '../../features/settingsPanel/SettingsPanel.js';
import { Z } from '@config/zIndex';
import Scroll from '../../primitives/scroll/Scroll.js';
import css from './Layers.module.css'
import Button from '@primitives/button/Button.js';
import { settingsStore } from '@stores/settings.store.js';
/** LAYER 3/3! */
export default function OverlayLayer() {

  const panelOpen = settingsStore(s => s.settings.panelOpen)
  const update = settingsStore.getState().update


  return (
    <>
      <Button
        id='settings'
        onPressRelease={() => update("panelOpen", !panelOpen)}>settings</Button>


      <div className={css.layer} style={{ zIndex: Z.overlay }}>
        {panelOpen ? <SettingsPanel /> : ''}


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