
import React from 'react'
import ReactPlayer from 'react-player'

interface VideoSection {
  _type: 'videoSection'
  _key: string
  title?: string
  videoUrl: string
}

interface VideoSectionComponentProps {
  block: VideoSection
}

const VideoSectionComponent: React.FC<VideoSectionComponentProps> = ({ block }) => {
  console.log('VideoSectionComponent received block:', block)

  if (!block?.videoUrl) {
    console.warn('VideoSectionComponent: No videoUrl provided')
    return null
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8 text-center">
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
