export interface MediaItem {
    url: string
    blob: Blob
    objectUrl: string
    width: number
    height: number
    type: 'image' | 'video'
}

interface QueuedRequest {
    url: string
    isVideo: boolean
    onProgress?: (percent: number) => void
    resolve: (item: MediaItem) => void
    reject: (error: Error) => void
    abortController: AbortController
}

class MediaCache {
    private static instance: MediaCache
    private cache: Map<string, MediaItem> = new Map()
    private pendingRequests: Map<string, Promise<MediaItem>> = new Map()
    private requestQueue: QueuedRequest[] = []
    private activeRequests = 0
    private readonly MAX_CONCURRENT = 5

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

    private maxSize = 30

    public set(url: string, item: MediaItem): void {
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

    private processQueue() {
        while (this.activeRequests < this.MAX_CONCURRENT && this.requestQueue.length > 0) {
            const request = this.requestQueue.shift()
            if (request) {
                this.activeRequests++
                this.executeRequest(request)
            }
        }
    }

    private async executeRequest(request: QueuedRequest) {
        try {
            const item = await this.loadInternal(
                request.url,
                request.isVideo,
                request.onProgress,
                request.abortController
            )
            request.resolve(item)
        } catch (error) {
            request.reject(error as Error)
        } finally {
            this.activeRequests--
            this.processQueue()
        }
    }

    private async loadFallback(
        src: string,
        isVideo: boolean,
        onProgress?: (percent: number) => void,
        abortController?: AbortController
    ): Promise<MediaItem> {
        let width = 0
        let height = 0
        let progress = 0

        const progressInterval = setInterval(() => {
            if (abortController?.signal.aborted) {
                clearInterval(progressInterval)
                return
            }
            progress += Math.random() * 10
            if (progress > 90) progress = 90
            onProgress?.(progress)
        }, 200)

        const cleanup = () => clearInterval(progressInterval)

        try {
            if (abortController?.signal.aborted) {
                // Silenciosamente devolver resultado vacío si ya está abortado
                return { src, width: 0, height: 0, isVideo }
            }

            if (isVideo) {
                const video = document.createElement('video')
                video.src = src
                video.preload = 'metadata'
                await new Promise<void>((res, rej) => {
                    const abortHandler = () => {
                        video.src = ''
                        // Resolver silenciosamente en lugar de rechazar
                        res()
                    }
                    abortController?.signal.addEventListener('abort', abortHandler)
                    
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
                await new Promise<void>((res, rej) => {
                    const abortHandler = () => {
                        img.src = ''
                        // Resolver silenciosamente en lugar de rechazar para evitar errores no capturados
                        res()
                    }
                    abortController?.signal.addEventListener('abort', abortHandler)
                    
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

    private async loadInternal(
        src: string,
        isVideo: boolean,
        onProgress?: (percent: number) => void,
        abortController?: AbortController
    ): Promise<MediaItem> {
        const isFirebaseStorage = src.includes('firebasestorage.googleapis.com')

        if (isFirebaseStorage) {
            return this.loadFallback(src, isVideo, onProgress, abortController)
        }

        return new Promise<MediaItem>(async (resolve, reject) => {
            if (abortController?.signal.aborted) {
                // Resolver silenciosamente si ya está abortado
                resolve({ src, width: 0, height: 0, isVideo })
                return
            }

            try {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', src, true)
                xhr.responseType = 'blob'

                const abortHandler = () => {
                    xhr.abort()
                    // Resolver silenciosamente en lugar de rechazar
                    resolve({ src, width: 0, height: 0, isVideo })
                }
                abortController?.signal.addEventListener('abort', abortHandler)

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
                    this.loadFallback(src, isVideo, onProgress, abortController)
                        .then(resolve)
                        .catch(reject)
                }

                xhr.send()
            } catch (error) {
                this.loadFallback(src, isVideo, onProgress, abortController)
                    .then(resolve)
                    .catch(reject)
            }
        })
    }

    public load(
        src: string,
        isVideo: boolean = false,
        onProgress?: (percent: number) => void,
        abortController?: AbortController
    ): Promise<MediaItem> {
        if (this.cache.has(src)) {
            onProgress?.(100)
            return Promise.resolve(this.cache.get(src)!)
        }

        if (this.pendingRequests.has(src)) {
            return this.pendingRequests.get(src)!
        }

        const promise = new Promise<MediaItem>((resolve, reject) => {
            const controller = abortController || new AbortController()
            this.requestQueue.push({
                url: src,
                isVideo,
                onProgress,
                resolve,
                reject,
                abortController: controller
            })
            this.processQueue()
        })

        this.pendingRequests.set(src, promise)
        
        promise.finally(() => {
            this.pendingRequests.delete(src)
        })

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
        this.requestQueue = []
        this.activeRequests = 0
    }
}

export const mediaCache = MediaCache.getInstance()
