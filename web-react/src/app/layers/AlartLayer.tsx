import { Z } from '@config/zIndex'
import css from './Layers.module.css'
import AlertPanel from '@infrastructure/AlertPanel'
export default function AlertLayer() {
  return (
    <div className={css.layer} style={{ zIndex: Z.alart }} >

      <AlertPanel />

    </div>
  )
}