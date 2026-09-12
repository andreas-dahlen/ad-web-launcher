import chokidar, { type FSWatcher } from 'chokidar'

export function watchConfig(
  rootDir: string,
  onChange: () => Promise<void>,
): FSWatcher {
  const watcher = chokidar.watch(
    `${rootDir}/compiler.config.json`,
    { ignoreInitial: true },
  )

  watcher.on('change', () => {
    console.log("compiler.config.json changed.")
    console.log("Restarting...")
    void onChange()
  })

  return watcher
}