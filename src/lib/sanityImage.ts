/**
 * Constructs a full URL for a Sanity image asset reference
 * @param ref - The Sanity image reference (e.g., "image-abc123-1200x630-jpg")
 * @param options - Optional parameters for image transformation
 * @returns The full CDN URL for the image
 */
export function getSanityImageUrl(
  ref: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  }
): string {
  const projectId = 'yxesi03x'
  const dataset = 'production'
  
  // Extract the asset ID and dimensions from the reference
  const [, assetId, dimensions, format] = ref.match(/^image-([a-z0-9]+)-(\d+x\d+)-(\w+)$/) || []
  
  if (!assetId) {
    console.error('Invalid Sanity image reference:', ref)
    return ''
  }
  
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}`
  
  // Add transformation parameters if provided
  const params = new URLSearchParams()
  if (options?.width) params.append('w', options.width.toString())
  if (options?.height) params.append('h', options.height.toString())
  if (options?.quality) params.append('q', options.quality.toString())
  if (options?.format) params.append('fm', options.format)
  
  const queryString = params.toString()
  if (queryString) {
    url += `?${queryString}`
  }
  
  return url
}