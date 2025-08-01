/**
 * Utility functions for handling Sanity assets
 */

interface SanityAssetReference {
  _ref: string;
  _type: 'reference';
}

interface SanityAsset {
  _type: 'image' | 'file';
  asset?: SanityAssetReference | { url: string };
  url?: string;
}

const SANITY_CDN_URL = 'https://cdn.sanity.io';
const PROJECT_ID = 'yxesi03x';
const DATASET = 'production';

/**
 * Constructs a Sanity asset URL from various asset formats
 * @param asset - The asset object from Sanity
 * @returns The full URL to the asset
 */
export function getSanityAssetUrl(asset: SanityAsset | SanityAssetReference | string | undefined | null): string | null {
  if (!asset) return null;
  
  // If it's already a URL string
  if (typeof asset === 'string') {
    return asset;
  }
  
  // If it has a direct URL property
  if ('url' in asset && asset.url) {
    return asset.url;
  }
  
  // If it has an asset with URL
  if ('asset' in asset && asset.asset && 'url' in asset.asset) {
    return asset.asset.url;
  }
  
  // If it's a reference or has an asset reference
  const ref = '_ref' in asset ? asset._ref : 
              ('asset' in asset && asset.asset && '_ref' in asset.asset) ? asset.asset._ref : 
              null;
              
  if (!ref) return null;
  
  // Parse the reference
  // Format: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg"
  const [, id, dimensions, format] = ref.split('-');
  
  if (!id || !dimensions || !format) return null;
  
  // Determine if it's an image or file
  const isImage = ref.startsWith('image-');
  const type = isImage ? 'images' : 'files';
  
  // Construct the URL
  return `${SANITY_CDN_URL}/${type}/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}

/**
 * Gets dimensions from a Sanity image reference
 * @param ref - The reference string
 * @returns Object with width and height, or null
 */
export function getImageDimensions(ref: string): { width: number; height: number } | null {
  const match = ref.match(/(\d+)x(\d+)/);
  if (!match) return null;
  
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10)
  };
}

/**
 * Helper to check if an asset is an image
 */
export function isImageAsset(asset: any): boolean {
  if (!asset) return false;
  
  if (typeof asset === 'string') {
    return asset.includes('/images/') || asset.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null;
  }
  
  if (asset._type === 'image') return true;
  
  if (asset._ref && typeof asset._ref === 'string') {
    return asset._ref.startsWith('image-');
  }
  
  if (asset.asset?._ref && typeof asset.asset._ref === 'string') {
    return asset.asset._ref.startsWith('image-');
  }
  
  return false;
}