import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWallpapers } from '@api/wallpaper'

describe('[FETCH WALLPAPERS]', () => {
  beforeEach(() => {
    // Clear any previous mocks before each test
    vi.restoreAllMocks()

    // Mock the environment variable
    vi.stubEnv('VITE_PIXABAY_KEY', 'mocked_api_key')
  })

  it('should successfully fetch and return an array of image URLs', async () => {
    // 1. Arrange: Mock a successful Pixabay API response
    const mockPixabayResponse = {
      hits: [
        { largeImageURL: 'https://example.com/photo1.jpg' },
        { largeImageURL: 'https://example.com/photo2.jpg' },
      ],
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPixabayResponse,
    })

    vi.stubGlobal('fetch', mockFetch)

    // 2. Act: Run the function
    const urls = await fetchWallpapers('mountains')

    // 3. Assert: Verify fetch was called with the correct URL and key
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('key=mocked_api_key')
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=mountains')
    )

    // Verify the return value mapping
    expect(urls).toEqual([
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ])
  })

  it('should return an empty array if Pixabay returns no hits', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hits: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const urls = await fetchWallpapers('something_obscure')
    expect(urls).toEqual([])
  })

  it('should throw an error if the fetch response is not ok', async () => {
    // Mock an API failure (e.g., 401 Unauthorized or 429 Too Many Requests)
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    })
    vi.stubGlobal('fetch', mockFetch)

    // Assert that the function rejects with the expected error message
    await expect(fetchWallpapers()).rejects.toThrow('Pixabay error: 401')
  })
})