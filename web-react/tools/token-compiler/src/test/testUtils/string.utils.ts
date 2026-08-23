
export const stringUtilsMock = {
  colors: {
    muted: 'muted',
    file: 'file',
    subHeading: 'subHeading',
    success: 'success',
    heading: 'heading',
    value: 'value',
  },

  paint: String,

  formatLogPath: (path: string) => {
    const marker = '/generated/'
    const index = path.indexOf(marker)

    return index === -1
      ? path
      : path.slice(index + marker.length)
  },
}