
export default function LoadingScene({ visible }: { visible: boolean }) {
  return (
    <div className={`loading ${visible ? '' : 'loading-fade'}`}> Loading </div>
  )
}