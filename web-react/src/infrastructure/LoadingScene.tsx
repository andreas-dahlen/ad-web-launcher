import clsx from 'clsx'
import css from './System.module.css'
export default function LoadingScene({ visible }: { visible: boolean }) {
  return (
    <div className={clsx(css.loading, !visible && css.fade)}> Loading </div>
  )
}