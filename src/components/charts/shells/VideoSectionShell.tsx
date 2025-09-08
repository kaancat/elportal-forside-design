import React from 'react';
import { Play } from 'lucide-react';

interface VideoSectionShellProps {
  block: {
    _type: 'videoSection';
    title?: string;
    videoUrl?: string;
    customThumbnail?: {
      alt?: string;
    };
  };
}

/**
 * SSR Shell for VideoSection component
 * Provides SEO-optimized static content while client component hydrates
 */
const VideoSectionShell: React.FC<VideoSectionShellProps> = ({ block }) => {
  if (!block?.videoUrl) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-8 text-center">
            {block.title}
          </h2>
        )}
        
        {/* Video placeholder for SEO */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
          <div className="absolute inset-0 rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
            {/* Static video placeholder */}
            <div className="text-center">
              <div className="bg-brand-green bg-opacity-90 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                <Play className="w-12 h-12 text-white fill-current ml-1" />
              </div>
              <p className="text-gray-600 font-medium">
                {block.title || 'Video indhold'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Klik for at afspille video
              </p>
            </div>
          </div>
        </div>

        {/* SEO-friendly content */}
        <div className="mt-8 prose prose-lg max-w-none text-center text-gray-700">
          <p>
            Se vores video for at lære mere om elpriser og energibesparelser i Danmark. 
            Få værdifulde tips til hvordan du kan spare penge på din elregning.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoSectionShell;