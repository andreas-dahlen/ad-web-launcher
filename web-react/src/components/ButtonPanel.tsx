import Button from '@components/primitives/button/Button'

const buttons = [
  { id: 1, label: '1', type: 'spotify', package: 'com.spotify.music' },
  { id: 2, label: '2', type: 'youtube', package: 'com.google.android.youtube' },
  { id: 3, label: '3', type: 'custom' },
  { id: 4, label: '4', type: 'custom' },
  { id: 5, label: '5', type: 'custom' },
  { id: 6, label: '6', type: 'custom' }
]

export default function ButtonGrid() {
  const onPressRelease = (item: typeof buttons[0]) => {
    if (item.package && typeof Android !== 'undefined') {
      Android.openApp(item.package)
    }
  }

  return (
    <div className="button-grid">
      {buttons.map(item => (
        <Button
          key={item.id}
          id={`grid-btn-${item.id}`}
          className="grid-button"
          onPressRelease={() => onPressRelease(item)}
        >
          <span>{item.label}</span>
        </Button>
      ))}
    </div>
  )
}