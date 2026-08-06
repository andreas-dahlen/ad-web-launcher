import { Z } from '@config/zIndex.config.ts'
import css from './Layers.module.css'
import AlertPanel from '../../panels/AlertPanel.tsx'
import clsx from 'clsx'
//layer 4/4
export default function AlertLayer() {
  return (
    <div className={clsx(css.layer, "center")} style={{ zIndex: Z.alart }} >

      <AlertPanel />

    </div>
  )
}