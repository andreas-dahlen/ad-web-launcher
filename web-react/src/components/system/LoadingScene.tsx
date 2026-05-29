import clsx from 'clsx'
import systemCss from './System.module.css'
export default function LoadingScene({ visible }: { visible: boolean }) {
  return (
    <div className={clsx(systemCss.loading, !visible && systemCss.fade)}> Loading </div>
  )
}