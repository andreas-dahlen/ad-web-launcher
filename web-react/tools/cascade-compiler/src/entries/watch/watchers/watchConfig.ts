import chokidar, { type FSWatcher } from 'chokidar'

export function watchConfig(
  rootDir: string,
  onChange: () => Promise<void>,
): FSWatcher {
  const watcher = chokidar.watch(
    `${rootDir}/cascade.config.json`,
    { ignoreInitial: true },
  )

  watcher.on('change', () => {
    console.log("cascade.config.json changed.")
    console.log("Restarting...")
    void onChange()
  })

  return watcher
}