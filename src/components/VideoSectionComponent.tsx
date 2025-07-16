import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import { Play } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { VideoSection } from '@/types/sanity'

interface VideoSectionComponentProps {
  block: VideoSection
}

const VideoSectionComponent: React.FC<VideoSectionComponentProps> = ({ block }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!block?.videoUrl) {
    return null
  }

  // If there's a custom thumbnail, use the in-place playback approach
  if (block.customThumbnail) {
    const thumbnailUrl = urlFor(block.customThumbnail).width(800).height(450).url()

    return (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {block.title && (
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-8 text-center">
              {block.title}
            </h2>
          )}
          
          <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden shadow-lg">
              {!isPlaying ? (
                // Thumbnail View
                <div 
                  className="relative cursor-pointer group w-full h-full"
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src={thumbnailUrl}
                    alt={block.customThumbnail.alt || 'Video thumbnail'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-brand-green bg-opacity-90 rounded-full p-6 transition-all duration-300 group-hover:bg-opacity-100 group-hover:scale-110 shadow-lg">
                      <Play className="w-12 h-12 text-white fill-current ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                // Player View
                <ReactPlayer
                  url={block.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={true}
                  light={false}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1, autoplay: 1 }
                    },
                    vimeo: {
                      playerOptions: { color: '84db41', autoplay: true }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Fallback: render the standard react-player directly
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-8 text-center">
            {block.title}
          </h2>
        )}
        
        <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
          <div className="absolute inset-0 rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              url={block.videoUrl}
              width="100%"
              height="100%"
              controls
              playing={false}
              light={false}
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                },
                vimeo: {
                  playerOptions: { color: '84db41' }
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoSectionComponent
