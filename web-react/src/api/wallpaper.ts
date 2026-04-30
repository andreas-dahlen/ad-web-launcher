const ACCESS_KEY = '55650523-78ea7add58a96a830ace8b39f'

interface PixabayPhoto {
  largeImageURL: string
}

interface PixabayResponse {
  hits: PixabayPhoto[]
}

export async function fetchWallpapers(query = 'nature'): Promise<string[]> {
  const res = await fetch(
    `https://pixabay.com/api/?key=${ACCESS_KEY}&q=${query}&image_type=photo&orientation=vertical&per_page=20safeseach=true`
  )

  if (!res.ok) throw new Error(`Pixabay error: ${res.status}`)

  const data = await res.json() as PixabayResponse
  return data.hits.map((photo) => photo.largeImageURL)
}