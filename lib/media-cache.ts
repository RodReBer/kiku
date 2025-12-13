export interface MediaItem {
    url: string
    blob: Blob
    objectUrl: string
    width: number
    height: number
    type: 'image' | 'video'
}

class MediaCache {
    private static instance: MediaCache
    private cache: Map<string, MediaItem> = new Map()
    private pendingRequests: Map<string, Promise<MediaItem>> = new Map()

    private constructor() { }

    public static getInstance(): MediaCache {
        if (!MediaCache.instance) {
            MediaCache.instance = new MediaCache()
        }
        return MediaCache.instance
    }

    public has(url: string): boolean {
        return this.cache.has(url)
    }

    public get(url: string): MediaItem | undefined {
        return this.cache.get(url)
    }

    private maxSize = 20 // Limit cache to 20 items to prevent OOM

    public set(url: string, item: MediaItem): void {
        // If cache is full, remove oldest item (first key in Map)
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value
            if (firstKey) {
                const itemToRemove = this.cache.get(firstKey)
                if (itemToRemove && itemToRemove.objectUrl && itemToRemove.objectUrl !== itemToRemove.url) {
                    URL.revokeObjectURL(itemToRemove.objectUrl)
                }
                this.cache.delete(firstKey)
            }
        }
        this.cache.set(url, item)
    }

    public getPending(url: string): Promise<MediaItem> | undefined {
        return this.pendingRequests.get(url)
    }

    public setPending(url: string, promise: Promise<MediaItem>): void {
        this.pendingRequests.set(url, promise)
    }

    public removePending(url: string): void {
        this.pendingRequests.delete(url)
    }

    private async loadFallback(src: string, isVideo: boolean, onProgress?: (percent: number) => void): Promise<MediaItem> {
        let width = 0
        let height = 0
        let progress = 0

        const progressInterval = setInterval(() => {
            progress += Math.random() * 10
            if (progress > 90) progress = 90
            onProgress?.(progress)
        }, 200)

        const cleanup = () => clearInterval(progressInterval)

        try {
            if (isVideo) {
                const video = document.createElement('video')
                video.src = src
                video.preload = 'metadata'
                await new Promise<void>((res) => {
                    video.onloadedmetadata = () => {
                        width = video.videoWidth
                        height = video.videoHeight
                        res()
                    }
                    video.onerror = () => res()
                    setTimeout(res, 5000)
                })
            } else {
                const img = new Image()
                img.src = src
                await new Promise<void>((res) => {
                    img.onload = () => {
                        width = img.naturalWidth
                        height = img.naturalHeight
                        res()
                    }
                    img.onerror = () => res()
                    setTimeout(res, 5000)
                })
            }
        } finally {
            cleanup()
        }

        onProgress?.(100)

        return {
            url: src,
            blob: new Blob([]),
            objectUrl: src,
            width: width || 800,
            height: height || 600,
            type: isVideo ? 'video' : 'image'
        }
    }

    public load(src: string, isVideo: boolean = false, onProgress?: (percent: number) => void): Promise<MediaItem> {
        if (this.cache.has(src)) {
            onProgress?.(100)
            return Promise.resolve(this.cache.get(src)!)
        }

        if (this.pendingRequests.has(src)) {
            return this.pendingRequests.get(src)!
        }

        const isFirebaseStorage = src.includes('firebasestorage.googleapis.com')

        if (isFirebaseStorage) {
            const promise = this.loadFallback(src, isVideo, onProgress)
            this.pendingRequests.set(src, promise)

            promise.then(item => {
                this.cache.set(src, item)
                this.pendingRequests.delete(src)
            }).catch(() => {
                this.pendingRequests.delete(src)
            })

            return promise
        }

        const promise = new Promise<MediaItem>(async (resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', src, true)
                xhr.responseType = 'blob'

                xhr.onprogress = (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = (event.loaded / event.total) * 100
                        onProgress(percentComplete)
                    }
                }

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const blob = xhr.response
                        const objectUrl = URL.createObjectURL(blob)

                        let width = 0
                        let height = 0

                        if (isVideo) {
                            const video = document.createElement('video')
                            video.src = objectUrl
                            await new Promise<void>((resolve) => {
                                video.onloadedmetadata = () => {
                                    width = video.videoWidth
                                    height = video.videoHeight
                                    resolve()
                                }
                            })
                        } else {
                            const img = new Image()
                            img.src = objectUrl
                            await new Promise<void>((resolve) => {
                                img.onload = () => {
                                    width = img.naturalWidth
                                    height = img.naturalHeight
                                    resolve()
                                }
                            })
                        }

                        const item: MediaItem = {
                            url: src,
                            blob,
                            objectUrl,
                            width: width || 800,
                            height: height || 600,
                            type: isVideo ? 'video' : 'image'
                        }

                        this.cache.set(src, item)
                        this.pendingRequests.delete(src)
                        onProgress?.(100)
                        resolve(item)
                    } else {
                        throw new Error(`HTTP error! status: ${xhr.status}`)
                    }
                }

                xhr.onerror = () => {
                    this.loadFallback(src, isVideo, onProgress)
                        .then(resolve)
                        .catch(reject)
                }

                xhr.send()
            } catch (error) {
                this.loadFallback(src, isVideo, onProgress)
                    .then(resolve)
                    .catch(reject)
            }
        })

        this.pendingRequests.set(src, promise)
        return promise
    }

    public clear() {
        this.cache.forEach(item => {
            if (item.objectUrl && item.objectUrl !== item.url) {
                URL.revokeObjectURL(item.objectUrl)
            }
        })
        this.cache.clear()
        this.pendingRequests.clear()
    }
}

export const mediaCache = MediaCache.getInstance()
