import { useState, useEffect, useRef } from 'react'
import { mediaCache, type MediaItem } from '@/lib/media-cache'

interface UseMediaLoaderResult {
    mediaItem: MediaItem | null
    loading: boolean
    progress: number
    error: string | null
}

export function useMediaLoader(src: string, isVideo: boolean = false): UseMediaLoaderResult {
    const [mediaItem, setMediaItem] = useState<MediaItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    useEffect(() => {
        if (!src) {
            setMediaItem(null)
            return
        }

        // Start new download
        setLoading(true)
        setProgress(0)
        setError(null)

        mediaCache.load(src, isVideo, (percent) => {
            if (mountedRef.current) {
                setProgress(percent)
            }
        })
            .then((item) => {
                if (mountedRef.current) {
                    setMediaItem(item)
                    setLoading(false)
                    setProgress(100)
                }
            })
            .catch((err) => {
                if (mountedRef.current) {
                    setError(err.message || 'Error loading media')
                    setLoading(false)
                }
            })

    }, [src, isVideo])

    return { mediaItem, loading, progress, error }
}
