
export default function LoadingScene({ fading }: { fading: boolean }) {
  return (
    <div className={`loading ${fading ? 'loading-fade' : ''}`}> Loading </div>
  )
}