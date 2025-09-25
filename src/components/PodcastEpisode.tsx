'use client'

import Image from 'next/image'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

import { PodcastEpisodeBlock } from '@/types/sanity'
import { cn } from '@/lib/utils'
import { getSanityAssetUrl } from '@/lib/sanityAsset'
import BlockContent from './BlockContent'

interface PodcastEpisodeProps {
  block: PodcastEpisodeBlock
}

const BRAND_GREEN = '#84db41'
const TRACK_BG = 'rgba(0, 26, 18, 0.08)'

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const totalSeconds = Math.floor(value)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const paddedSeconds = String(seconds).padStart(2, '0')
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
  }
  return `${minutes}:${paddedSeconds}`
}

function parseDurationString(raw?: string | null): number {
  if (!raw) return 0
  const parts = raw.split(':').map(part => Number(part))
  if (parts.some(part => Number.isNaN(part))) return 0
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    return hours * 3600 + minutes * 60 + seconds
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts
    return minutes * 60 + seconds
  }
  return parts[0]
}

const PodcastEpisode: React.FC<PodcastEpisodeProps> = ({ block }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(() => parseDurationString(block.duration))
  const audioUrl = block.audio?.url

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
        setDurationSeconds(audioEl.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioEl.addEventListener('timeupdate', handleTimeUpdate)
    audioEl.addEventListener('play', handlePlay)
    audioEl.addEventListener('pause', handlePause)
    audioEl.addEventListener('ended', handleEnded)

    return () => {
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioEl.removeEventListener('timeupdate', handleTimeUpdate)
      audioEl.removeEventListener('play', handlePlay)
      audioEl.removeEventListener('pause', handlePause)
      audioEl.removeEventListener('ended', handleEnded)
    }
  }, [])

  const effectiveDuration = useMemo(() => {
    if (durationSeconds && Number.isFinite(durationSeconds) && durationSeconds > 0) {
      return durationSeconds
    }
    return parseDurationString(block.duration)
  }, [durationSeconds, block.duration])

  const durationLabel = effectiveDuration > 0 ? formatTime(effectiveDuration) : block.duration
  const progressPercent = effectiveDuration > 0 ? Math.min((currentTime / effectiveDuration) * 100, 100) : 0

  const handleTogglePlayback = () => {
    const audioEl = audioRef.current
    if (!audioEl) return

    if (!audioUrl) {
      console.warn('No audio file provided for podcast episode')
      return
    }

    if (audioEl.paused) {
      audioEl.play().catch(error => {
        console.error('Failed to play audio', error)
      })
    } else {
      audioEl.pause()
    }
  }

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value)
    setCurrentTime(nextTime)
    if (audioRef.current && Number.isFinite(nextTime)) {
      audioRef.current.currentTime = nextTime
    }
  }

  const thumbnailUrl = getSanityAssetUrl(block.thumbnail)

  const thumbnailAlt = block.thumbnail?.alt || block.title || 'Podcast billede'

  return (
    <section
      className={cn(
        'mx-auto flex flex-col gap-4 rounded-2xl border border-brand-dark/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5',
        'focus-within:ring-2 focus-within:ring-brand-green/60'
      )}
      aria-label={block.title || 'Podcast episode'}
    >
      {thumbnailUrl && (
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-brand-green/10 sm:h-24 sm:w-24">
          <Image
            src={thumbnailUrl}
            alt={thumbnailAlt}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          {block.title && (
            <h3 className="text-base font-semibold text-brand-dark sm:text-lg">
              {block.title}
            </h3>
          )}
          {block.subtitle && (
            <p className="text-sm text-brand-dark/70">
              {block.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlayback}
              disabled={!audioUrl}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/70 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60'
              )}
              aria-label={isPlaying ? 'Pause podcast' : 'Afspil podcast'}
            >
              {isPlaying ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />}
            </button>

            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(effectiveDuration || 0, 1)}
                  step={1}
                  value={Math.min(currentTime, effectiveDuration || currentTime || 0)}
                  onChange={handleSeek}
                  className="w-full cursor-pointer accent-brand-green"
                  aria-label="Spol i podcast"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(effectiveDuration || 0, 1)}
                  aria-valuenow={Math.floor(currentTime)}
                  aria-valuetext={formatTime(currentTime)}
                  style={{
                    background: `linear-gradient(to right, ${BRAND_GREEN} ${progressPercent}%, ${TRACK_BG} ${progressPercent}%)`
                  }}
                />
                <span className="text-xs font-medium text-brand-dark/70" aria-live="polite">
                  {formatTime(currentTime)}
                </span>
              </div>
              <div className="flex justify-end">
                {durationLabel && (
                  <span className="text-xs text-brand-dark/60">{durationLabel}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {block.transcript && block.transcript.length > 0 && (
          <details className="group rounded-lg border border-brand-dark/5 bg-brand-green/[0.08] p-3 text-sm text-brand-dark/80">
            <summary className="cursor-pointer list-none font-medium text-brand-dark/90 transition-colors group-open:text-brand-dark">
              Læs transskription
            </summary>
            <div className="mt-2 space-y-2">
              <BlockContent content={block.transcript} className="prose prose-sm text-brand-dark/80" />
            </div>
          </details>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="metadata"
        aria-hidden
      />

      {!audioUrl && (
        <p className="sr-only">Ingen lydfil er knyttet til denne episode.</p>
      )}

      <noscript>
        {audioUrl ? (
          <audio controls src={audioUrl} className="mt-4 w-full">
            Din browser understøtter ikke lydafspilning.
          </audio>
        ) : null}
      </noscript>
    </section>
  )
}

export default PodcastEpisode
