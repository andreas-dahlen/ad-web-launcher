type MirrorProps = {
  laneId: 'top' | 'mid' | 'bottom' | 'wallpaper'
  children: React.ReactNode
}

export const Mirror = ({ laneId, children }: MirrorProps) => {
  const lanePosition = useLanePosition(laneId) // custom hook, tracks lane movement

  return (
    <div
      className="mirror"
      style={{
        position: 'absolute',
        top: lanePosition.y,
        left: lanePosition.x,
        pointerEvents: 'none', // always non-interactive
      }}
    >
      {children}
    </div>
  )
}