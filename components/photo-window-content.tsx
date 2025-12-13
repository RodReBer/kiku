"use client"

import { useState, useCallback, memo, useEffect, useRef } from "react"
import { mediaCache, type MediaItem } from "@/lib/media-cache"

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

export function PhotoWindowContent({ 
  src, 
  highQualitySrc, 
  isHighQuality, 
  alt, 
  isMaximized, 
  isMinimized, 
  onLoad, 
  isVideo: isVideoProp 
}: PhotoWindowContentProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const displaySrc = (isHighQuality && highQualitySrc) ? highQualitySrc : src
  const isVideo = isVideoProp ?? isVideoFile(displaySrc)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!containerRef.current || shouldLoad) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { threshold: 0.01, rootMargin: '50px' }
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [shouldLoad])

  // Cargar imagen cuando shouldLoad es true
  useEffect(() => {
    if (!shouldLoad || isMinimized) return

    abortControllerRef.current = new AbortController()
    const controller = abortControllerRef.current

    setLoading(true)
    setError(false)
    setProgress(0)

    mediaCache.load(
      displaySrc,
      isVideo,
      (percent: number) => {
        if (!controller.signal.aborted) {
          setProgress(percent)
        }
      },
      controller
    )
      .then((item: MediaItem) => {
        if (!controller.signal.aborted) {
          setImageSrc(item.objectUrl)
          setLoading(false)
          setProgress(100)
          onLoad?.({ width: item.width, height: item.height })
        }
      })
      .catch((err: any) => {
        // Ignorar errores de abort - son esperados
        if (controller.signal.aborted || err?.message === 'Request aborted') {
          return
        }
        console.error('Error loading media:', err)
        setError(true)
        setLoading(false)
        onLoad?.()
      })

    return () => {
      try {
        controller.abort()
      } catch (e) {
        // Ignorar errores de abort durante cleanup
      }
    }
  }, [shouldLoad, displaySrc, isVideo, isMinimized, onLoad])

  // Limpiar src cuando se minimiza
  useEffect(() => {
    if (isMinimized) {
      setImageSrc('')
      abortControllerRef.current?.abort()
    }
  }, [isMinimized])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
    >
      {isMinimized ? (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-500">Minimizado</span>
        </div>
      ) : (
        <>
          {loading && !error && (
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

          {!shouldLoad && !loading && !error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          )}

          {shouldLoad && imageSrc && (
            <>
              {isVideo ? (
                <video
                  src={imageSrc}
                  controls
                  playsInline
                  autoPlay={false}
                  loop
                  muted={false}
                  className={`w-full h-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                  style={{ objectFit: 'cover' }}
                  preload="auto"
                >
                  Tu navegador no soporta el tag de video.
                </video>
              ) : (
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt={alt}
                  className={`w-full h-full ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                  style={{ objectFit: 'cover' }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default memo(PhotoWindowContent)
