import SettingsPanel from '../../panels/SettingsPanel.js';
import { Z } from '@config/zIndex';
import Scroll from '../../primitives/Scroll/Scroll.js';
import css from './Layers.module.css'
import Button from '@primitives/Button/Button.js';
import { settingsStore } from '@stores/settings.store.js';
import clsx from 'clsx';
/** LAYER 3/3! */
export default function OverlayLayer() {

  const panelOpen = settingsStore(s => s.settings.panelOpen)
  const update = settingsStore.getState().update


  return (
    <div className={clsx(css.layer, "center")} style={{ zIndex: Z.overlay }}>
      <Button
        id='settings'
        onPressRelease={() => update("panelOpen", !panelOpen)}>settings</Button>


      <div className={clsx(css.layer, "center")} style={{ zIndex: Z.overlay }}>
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
    </div>
  )
}