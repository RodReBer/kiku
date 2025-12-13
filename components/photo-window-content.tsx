"use client"

import { useState, useCallback, memo, useEffect, useRef } from "react"

interface PhotoWindowContentProps {
  src: string
  highQualitySrc?: string
  isHighQuality?: boolean
  alt: string
  isMaximized: boolean
  isMinimized?: boolean
  onLoad?: (dimensions?: { width: number; height: number }) => void
  isVideo?: boolean
}

function isVideoFile(src: string): boolean {
  if (!src) return false
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv']
  const cleanSrc = src.split('?')[0]
  return videoExtensions.some(ext => cleanSrc.toLowerCase().endsWith(ext)) || (src.includes('%2F') && /\.(mp4|webm|mov|avi|mkv)/i.test(cleanSrc))
}

export function PhotoWindowContent({ src, highQualitySrc, isHighQuality, alt, isMaximized, isMinimized, onLoad, isVideo: isVideoProp }: PhotoWindowContentProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const displaySrc = (isHighQuality && highQualitySrc) ? highQualitySrc : src
  const isVideo = isVideoProp ?? isVideoFile(displaySrc)

  useEffect(() => {
    if (isMinimized || !containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isMinimized])

  useEffect(() => {
    if (isMinimized && imgRef.current) {
      // Clear src to free memory
      imgRef.current.src = ''
    }
  }, [isMinimized])

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        const increment = prev < 50 ? 12 : 4
        return Math.min(90, prev + increment)
      })
    }, 80)
    return () => clearInterval(interval)
  }, [loading])

  const handleLoad = useCallback((e: Event) => {
    setLoading(false)
    setProgress(100)
    let dimensions: { width: number; height: number } | undefined
    const target = e.target as HTMLImageElement | HTMLVideoElement
    if (target instanceof HTMLVideoElement) {
      const width = target.videoWidth || target.clientWidth || 800
      const height = target.videoHeight || target.clientHeight || 600
      dimensions = { width, height }
    } else {
      const img = target as HTMLImageElement
      dimensions = {
        width: img.naturalWidth || img.width || 800,
        height: img.naturalHeight || img.height || 600,
      }
    }
    onLoad?.(dimensions)
  }, [onLoad])

  const handleError = useCallback(() => {
    setLoading(false)
    setProgress(100)
    setError(true)
    onLoad?.()
  }, [onLoad])

  useEffect(() => {
    const img = imgRef.current
    if (!img || isVideo) return

    setLoading(true)
    setError(false)
    setProgress(0)

    img.addEventListener('load', handleLoad as EventListener)
    img.addEventListener('error', handleError)

    // Check if image is already loaded/cached
    // This handles cases where browser loads from cache before React attaches listeners
    if (img.complete && img.naturalWidth > 0) {
      // Image is already loaded, trigger handleLoad immediately
      setLoading(false)
      setProgress(100)
      const dimensions = {
        width: img.naturalWidth || img.width || 800,
        height: img.naturalHeight || img.height || 600,
      }
      onLoad?.(dimensions)
    }

    return () => {
      img.removeEventListener('load', handleLoad as EventListener)
      img.removeEventListener('error', handleError)
    }
  }, [displaySrc, handleLoad, handleError, isVideo, onLoad])

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden flex items-center justify-center`}>
      {isMinimized ? (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-500">Minimizado</span>
        </div>
      ) : (
        <>
          {loading && !error && shouldLoad && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-300 gap-4 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-gray-400 border-t-gray-600"></div>
              <div className="w-3/4 max-w-xs">
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs text-gray-500">Error al cargar {isVideo ? 'video' : 'imagen'}</span>
            </div>
          )}

          {isVideo && shouldLoad ? (
            <video
              src={displaySrc}
              controls
              playsInline
              autoPlay={false}
              loop
              muted={false}
              className={`w-full h-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              style={{ objectFit: 'cover' }}
              onLoadedMetadata={handleLoad as any}
              onLoadedData={handleLoad as any}
              onError={handleError}
              preload="auto"
            >
              Tu navegador no soporta el tag de video.
            </video>
          ) : !isVideo && shouldLoad ? (
            <img
              ref={imgRef}
              src={displaySrc}
              alt={alt}
              loading="eager"
              className={`w-full h-full ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              style={{ objectFit: 'cover', display: loading ? 'none' : 'block' }}
            />
          ) : !shouldLoad ? (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

// Memoizar para evitar re-renders durante drag
export default memo(PhotoWindowContent);
