import { createClient } from '@sanity/client';
import axios from 'axios';
import sharp from 'sharp';
import { createReadStream } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

// Free-to-use image URLs from Pexels (these are direct CDN URLs that are publicly available)
const imageUrls = {
  hero: {
    url: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg',
    alt: 'Moderne hjem med solpaneler - spar på strømmen med vedvarende energi',
    description: 'Solar panels on modern house roof'
  },
  kitchen: {
    url: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg',
    alt: 'Energieffektive køkkenapparater - spar op til 800 kr årligt',
    description: 'Modern energy-efficient kitchen'
  },
  smartHome: {
    url: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg',
    alt: 'Smart home teknologi til automatisk energibesparelse',
    description: 'Smart home control panel'
  },
  appliances: {
    url: 'https://images.pexels.com/photos/413960/pexels-photo-413960.jpeg',
    alt: 'Energimærkning på hvidevarer - vælg A++ eller bedre',
    description: 'Energy efficient washing machine'
  },
  heating: {
    url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    alt: 'Varmepumpe og termostat - optimal temperaturkontrol',
    description: 'Home heating system'
  },
  monitoring: {
    url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
    alt: 'Smart elmåler til overvågning af energiforbrug',
    description: 'Energy monitoring dashboard'
  }
};

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const buffer = Buffer.from(response.data);
    const tempPath = join(tmpdir(), filename);
    
    // Optimize image with sharp
    const optimized = await sharp(buffer)
      .resize(2400, 1600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    await writeFile(tempPath, optimized);
    return tempPath;
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return null;
  }
}

async function uploadImageToSanity(imagePath, filename) {
  try {
    const imageStream = createReadStream(imagePath);
    const asset = await client.assets.upload('image', imageStream, {
      filename: filename
    });
    
    // Clean up temp file
    await unlink(imagePath);
    
    return asset._id;
  } catch (error) {
    console.error(`Failed to upload image ${filename}:`, error.message);
    return null;
  }
}

async function updatePageWithImages() {
  try {
    console.log('Fetching current page content...');
    
    // Get current page content
    const page = await client.fetch(
      `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]`
    );
    
    if (!page) {
      console.error('Page not found!');
      return;
    }
    
    console.log('Found page, processing images...');
    
    // Map of content block keys to images
    const blockImageMap = {
      // Hero section
      '4a1b2c3d': imageUrls.hero,
      // Kitchen section
      'a5b6c7d8': imageUrls.kitchen,
      // Smart home section  
      'e9f0a1b2': imageUrls.smartHome,
      // Appliances section
      'c3d4e5f6': imageUrls.appliances,
      // Heating section
      'g7h8i9j0': imageUrls.heating,
      // Monitoring section
      'm3n4o5p6': imageUrls.monitoring
    };
    
    // Process each image
    const imageAssets = {};
    for (const [key, imageData] of Object.entries(blockImageMap)) {
      const filename = `energy-tips-${key}.jpg`;
      console.log(`Processing ${filename}...`);
      
      const imagePath = await downloadImage(imageData.url, filename);
      if (imagePath) {
        const assetId = await uploadImageToSanity(imagePath, filename);
        if (assetId) {
          imageAssets[key] = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: assetId
            },
            alt: imageData.alt
          };
          console.log(`✓ Uploaded ${filename}`);
        }
      }
    }
    
    console.log('Updating page content blocks...');
    
    // Update content blocks with images
    const updatedBlocks = page.contentBlocks.map((block, index) => {
      // Hero block (first block)
      if (index === 0 && block._type === 'hero') {
        return {
          ...block,
          image: imageAssets['4a1b2c3d'] || block.image
        };
      }
      
      // Kitchen section (index 4)
      if (index === 4 && block._type === 'pageSection' && block.title?.includes('Køkken')) {
        return {
          ...block,
          image: imageAssets['a5b6c7d8'] || block.image,
          imagePosition: 'right'
        };
      }
      
      // Smart home section (index 5)
      if (index === 5 && block._type === 'pageSection' && block.title?.includes('Smart Home')) {
        return {
          ...block,
          image: imageAssets['e9f0a1b2'] || block.image,
          imagePosition: 'left'
        };
      }
      
      // Appliances section (index 6)
      if (index === 6 && block._type === 'pageSection' && block.title?.includes('Hvidevarer')) {
        return {
          ...block,
          image: imageAssets['c3d4e5f6'] || block.image,
          imagePosition: 'right'
        };
      }
      
      // Heating section (index 10)
      if (index === 10 && block._type === 'pageSection' && block.title?.includes('Opvarmning')) {
        return {
          ...block,
          image: imageAssets['g7h8i9j0'] || block.image,
          imagePosition: 'left'
        };
      }
      
      // Monitoring section (index 13)
      if (index === 13 && block._type === 'pageSection' && block.title?.includes('Energiovervågning')) {
        return {
          ...block,
          image: imageAssets['m3n4o5p6'] || block.image,
          imagePosition: 'right'
        };
      }
      
      return block;
    });
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit();
    
    console.log('✅ Successfully updated page with images!');
    console.log(`View at: https://www.dinelportal.dk/energibesparende-tips-2025`);
    
  } catch (error) {
    console.error('Error updating page:', error);
  }
}

// Run the script
updatePageWithImages();