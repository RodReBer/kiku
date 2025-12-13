"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import RetroWindow from "./retro-window"
import Finder from "./finder"
import DrawingApp from "./drawing-app"
import { PhotoWindowContent } from "./photo-window-content"
import ShopGrid from "./shop-grid"
import { ErrorBoundary } from "./error-boundary"

import "../styles/nube-pos.css"
import { useData } from "@/context/data-context"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder" | "project"
  category: "design" | "photography" | "video" | "general"
}

interface WindowState {
  id: string
  title: string
  content: React.ReactNode
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  aspectRatio?: number
  preserveAspect?: boolean
  originalSize?: { width: number; height: number }
  backgroundTransparent?: boolean
}

export default function MacDesktop() {
  const { projects, products } = useData()
  const [windows, setWindows] = useState<WindowState[]>([])
  // Usar ref para zIndex garantiza incrementos atómicos sincrónicos durante el efecto cascada
  const nextZIndexRef = useRef(3000)
  const [nextZIndex, setNextZIndex] = useState(3000) // Base alto para ventanas (por encima de UI)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const imageCache = useRef<Map<string, { width: number; height: number }>>(new Map())
  const openImagesRef = useRef<Set<string>>(new Set()) // Track de imágenes abiertas
  const windowToImageRef = useRef<Map<string, string>>(new Map()) // windowId -> imagePath
  const mobileWindowOffsetRef = useRef({ x: 0, y: 0 }) // Offset incremental para mobile

  // Scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Función para resetear el escritorio (cerrar todas las ventanas)
  const resetDesktop = () => {
    setWindows([])
    setNextZIndex(3000)
    openImagesRef.current.clear() // Limpiar tracking de imágenes
    windowToImageRef.current.clear() // Limpiar mapa window-imagen
    mobileWindowOffsetRef.current = { x: 0, y: 0 } // Reset offset mobile
  }

  // Función para obtener dimensiones de imagen/video - OPTIMIZADA con cache
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    // Verificar si ya tenemos las dimensiones en cache
    if (imageCache.current.has(src)) {
      return Promise.resolve(imageCache.current.get(src)!)
    }

    // Detectar si es un video por la extensión
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)

    return new Promise((resolve) => {
      if (isVideo) {
        // Para videos, usar elemento video
        const video = document.createElement('video')
        video.preload = "metadata"

        video.onloadedmetadata = function () {
          try {
            let width = video.videoWidth || 800
            let height = video.videoHeight || 600

            // Calcular dimensiones para móvil y desktop
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768
            const maxWidth = isMobile ? Math.min(300, window.innerWidth * 0.9) : Math.min(800, window.innerWidth * 0.8)
            const maxHeight = isMobile ? Math.min(400, window.innerHeight * 0.6) : Math.min(600, window.innerHeight * 0.8)

            // Escalar si es necesario
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }

            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }

            // Tamaño mínimo
            width = Math.max(isMobile ? 250 : 300, width)
            height = Math.max(isMobile ? 150 : 200, height)

            const dimensions = { width: Math.round(width), height: Math.round(height) }
            // Guardar en cache
            imageCache.current.set(src, dimensions)
            resolve(dimensions)
          } catch (error) {
            console.error("Error processing video dimensions:", error)
            resolve({ width: 640, height: 480 })
          } finally {
            // Limpiar el video
            video.src = ''
          }
        }

        video.onerror = () => {
          video.src = ''
          resolve({ width: 640, height: 480 })
        }

        video.src = src
      } else {
        // Para imágenes, usar Image
        const img = new window.Image()
        img.crossOrigin = "anonymous"

        img.onload = function () {
          try {
            const imgElement = this as HTMLImageElement
            let width = imgElement.naturalWidth || imgElement.width || 500
            let height = imgElement.naturalHeight || imgElement.height || 400

            // Calcular dimensiones para móvil y desktop
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768
            const maxWidth = isMobile ? Math.min(300, window.innerWidth * 0.9) : Math.min(800, window.innerWidth * 0.8)
            const maxHeight = isMobile ? Math.min(400, window.innerHeight * 0.6) : Math.min(600, window.innerHeight * 0.8)

            // Escalar si es necesario
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }

            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }

            // Tamaño mínimo
            width = Math.max(isMobile ? 250 : 300, width)
            height = Math.max(isMobile ? 150 : 200, height)

            const dimensions = { width: Math.round(width), height: Math.round(height) }
            // Guardar en cache
            imageCache.current.set(src, dimensions)
            resolve(dimensions)
          } catch (error) {
            console.error("Error processing image dimensions:", error)
            resolve({ width: 400, height: 300 })
          }
        }

        img.onerror = () => {
          resolve({ width: 400, height: 300 })
        }

        img.src = src
      }
    })
  }

  const calculateMaximizedLayout = (aspectRatio: number) => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const containerBorder = 10 // padding 3px + border 7px del contenedor
    const usableWidth = screenWidth - containerBorder * 2
    const usableHeight = screenHeight - containerBorder * 2
    const chromeHeight = 28 // header de la ventana
    const chromeWidth = 4 // 2px borders laterales de la ventana

    let targetHeight = usableHeight
    let contentHeight = targetHeight - chromeHeight
    let contentWidth = contentHeight * aspectRatio
    let targetWidth = contentWidth + chromeWidth

    // Si excede el ancho util, ajustar por ancho
    if (targetWidth > usableWidth) {
      targetWidth = usableWidth
      contentWidth = targetWidth - chromeWidth
      contentHeight = contentWidth / aspectRatio
      targetHeight = contentHeight + chromeHeight
    }

    targetWidth = Math.ceil(targetWidth)
    targetHeight = Math.ceil(targetHeight)

    return {
      size: { width: targetWidth, height: targetHeight },
      position: {
        x: Math.max(0, (usableWidth - targetWidth) / 2),
        y: Math.max(0, (usableHeight - targetHeight) / 2)
      }
    }
  }

  const handleImageLoad = (id: string, dimensions?: { width: number; height: number }) => {
    if (!dimensions) return

    setWindows((prev) =>
      prev.map((win) => {
        if (win.id !== id) return win

        const newAspectRatio = dimensions.width / dimensions.height
        let newSize = win.size
        let newPosition = win.position

        // If window is already maximized, recalculate layout with new aspect ratio
        if (win.isMaximized) {
          const layout = calculateMaximizedLayout(newAspectRatio)
          newSize = layout.size
          newPosition = layout.position
        } else {
          // Adjust height to match aspect ratio, keeping width constant
          // Keep original position - no jumping after load
          const newHeight = Math.round(win.size.width / newAspectRatio)
          newSize = { ...win.size, height: newHeight }
          // newPosition stays as win.position - no recalculation
        }

        return {
          ...win,
          aspectRatio: newAspectRatio,
          size: newSize,
          position: newPosition
        }
      })
    )
  }

  const createWindow = (
    id: string,
    title: string,
    content: React.ReactNode,
    centered = false,
    customSize?: { width: number; height: number },
    customPosition?: { x: number; y: number },
    preserveAspect = false
  ) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const defaultSize = customSize || {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 800,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 600,
    }

    let position = customPosition || { x: 10, y: 60 }

    if (typeof window !== "undefined" && !customPosition) {
      if (centered || (isMobile && !customPosition)) {
        // El contenedor tiene border-[7px] a cada lado, más padding p-[3px] del padre
        // Total: 3px padding + 7px border = 10px a cada lado
        const borderOffset = 10 * 2 // 20px total (10px cada lado)
        const availableWidth = window.innerWidth - borderOffset
        const centeredX = Math.max(0, (availableWidth - defaultSize.width) / 2)
        position = {
          x: centeredX,
          y: Math.max(40, (window.innerHeight - defaultSize.height) / 2),
        }
      } else {
        // En desktop no centrado, posición aleatoria para efecto cascada
        position = {
          x: Math.floor(Math.random() * Math.max(0, window.innerWidth - defaultSize.width - 120) + 60),
          y: Math.floor(Math.random() * Math.max(0, window.innerHeight - defaultSize.height - 160) + 80),
        }
      }
    }

    // Incrementar Z-Index atómicamente usando Ref para evitar duplicados en actualizaciones rápidas
    nextZIndexRef.current += 1
    const newZIndex = nextZIndexRef.current

    // Sincronizar estado visual (opcional, pero útil para reactividad si algo depende de ello)
    // Usamos el callback form en el useEffect o aquí directamente pero sin depender del estado anterior
    setNextZIndex(newZIndex)

    const newWindow: WindowState = {
      id,
      title,
      content,
      isMinimized: false,
      isMaximized: false,
      position,
      size: defaultSize,
      zIndex: newZIndex,
      preserveAspect,
    }

    setWindows((prev) => [...prev, newWindow])
  }

  const openCenteredWindow = (title: string, content: React.ReactNode, size?: { width: number; height: number }) => {
    const windowId = `window-${Date.now()}-${Math.random()}`
    createWindow(windowId, title, content, true, size)
  }

  // Función para crear una ventana de foto con su propia carga independiente
  const createPhotoWindow = (
    imagePath: string,
    title: string,
    index: number,
    photoDimensions?: { width: number; height: number }
  ) => {
    // Verificar si ya está abierta
    if (openImagesRef.current.has(imagePath)) {
      console.log(`Imagen ya abierta: ${imagePath}`)
      return
    }

    // Marcar como abierta
    openImagesRef.current.add(imagePath)

    const windowId = `photo-${Date.now()}-${index}`

    // Guardar relación para limpiar al cerrar
    windowToImageRef.current.set(windowId, imagePath)

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    // Use dimensions from Firebase if available, otherwise calculate
    let finalWidth: number
    let finalHeight: number

    if (photoDimensions && photoDimensions.width && photoDimensions.height) {
      // Calculate scaled dimensions based on original aspect ratio
      let width = photoDimensions.width
      let height = photoDimensions.height
      const aspectRatio = width / height

      // Apply same scaling logic as getImageDimensions
      const maxWidth = isMobile ? Math.min(300, window.innerWidth * 0.9) : Math.min(800, window.innerWidth * 0.8)
      const maxHeight = isMobile ? Math.min(400, window.innerHeight * 0.6) : Math.min(600, window.innerHeight * 0.8)

      if (width > maxWidth) {
        height = maxWidth / aspectRatio
        width = maxWidth
      }

      if (height > maxHeight) {
        width = maxHeight * aspectRatio
        height = maxHeight
      }

      // Minimum size
      width = Math.max(isMobile ? 250 : 300, width)
      height = Math.max(isMobile ? 150 : 200, height)

      finalWidth = Math.round(width)
      finalHeight = Math.round(height) + 28 // +28 for window chrome
    } else {
      // Fallback to default sizes if no dimensions provided
      finalWidth = isMobile ? 300 : 500
      finalHeight = (isMobile ? 250 : 400) + 28
    }

    // Calculate position based on FINAL size to prevent jumping
    let position = { x: 10, y: 40 }
    if (typeof window !== "undefined") {
      if (isMobile) {
        // Mobile: Random position dentro de la pantalla visible
        const minX = 10
        const minY = 60
        const maxX = Math.max(minX, window.innerWidth - finalWidth - 10)
        const maxY = Math.max(minY, window.innerHeight - finalHeight - 100)
        
        position = {
          x: Math.floor(Math.random() * (maxX - minX)) + minX,
          y: Math.floor(Math.random() * (maxY - minY)) + minY
        }
      } else {
        // Desktop: Random position with proper margins based on FINAL size
        const minX = 60
        const minY = 80
        const maxX = Math.max(minX, window.innerWidth - finalWidth - 60)
        const maxY = Math.max(minY, window.innerHeight - finalHeight - 80)
        
        position = {
          x: Math.floor(Math.random() * (maxX - minX)) + minX,
          y: Math.floor(Math.random() * (maxY - minY)) + minY
        }
      }
    }

    // Desktop: usar imagen HD directa, Mobile: usar compresión wsrv.nl
    const displaySrc = isMobile
      ? `https://wsrv.nl/?url=${encodeURIComponent(imagePath)}&w=200&q=30&output=webp`
      : imagePath

    // Callback cuando la imagen carga - solo actualiza dimensiones
    const handlePhotoLoaded = (dims?: { width: number; height: number }) => {
      handleImageLoad(windowId, dims)
    }

    const content = (
      <PhotoWindowContent
        key={`${windowId}-${imagePath}`}
        src={displaySrc}
        highQualitySrc={imagePath}
        isHighQuality={!isMobile} // Desktop siempre HD, Mobile solo top 2
        alt={title}
        isMaximized={false}
        onLoad={handlePhotoLoaded}
      />
    )

    // Crear la ventana con tamaño y posición finales
    createWindow(
      windowId,
      title,
      content,
      false,
      { width: finalWidth, height: finalHeight },
      position,
      true
    )
  }

  // Efecto cascada visual - abre ventanas con delay fijo para percepción fluida
  const openVirusEffect = (photos: Array<{ url: string; width?: number; height?: number }>, projectName: string) => {
    // Validar URLs
    const validPhotos = photos.filter(p => typeof p.url === 'string' && p.url.trim() !== '')

    // Filtrar las que ya están abiertas
    const photosToOpen = validPhotos.filter(p => !openImagesRef.current.has(p.url))

    console.log(`🎬 Abriendo ${photosToOpen.length} imágenes para "${projectName}"`)

    if (photosToOpen.length === 0 && validPhotos.length > 0) {
      console.log('Todas las imágenes ya están abiertas')
      return
    }

    if (validPhotos.length === 0) {
      const content = (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gray-100">
          <div className="text-center">
            <h3 className="font-bold mb-4 text-black">No hay imágenes disponibles</h3>
            <p className="text-gray-700">No se encontraron URLs válidas para este proyecto.</p>
            <p className="text-gray-500 text-sm mt-2">Proyecto: {projectName}</p>
          </div>
        </div>
      )
      openCenteredWindow(`${projectName} - Sin imágenes`, content)
      return
    }

    // Delay entre cada ventana (ms) - aumentado para reducir pico de peticiones
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const delayBetween = isMobile ? 400 : 300

    // Abrir cada ventana con un delay fijo - el sistema de cola controla las peticiones
    photosToOpen.forEach((photo, index) => {
      setTimeout(() => {
        console.log(`📷 Abriendo ventana ${index + 1}/${photosToOpen.length}`)
        createPhotoWindow(
          photo.url,
          projectName,
          index,
          photo.width && photo.height ? { width: photo.width, height: photo.height } : undefined
        )
      }, index * delayBetween)
    })
  }

  const handleMaximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id !== id) return win

        const newMaximized = !win.isMaximized
        let newSize = win.size
        let newPosition = win.position
        // Save original size only if we are maximizing and don't have it yet
        const originalSize = win.originalSize || win.size

        if (newMaximized && win.aspectRatio) {
          const layout = calculateMaximizedLayout(win.aspectRatio)
          newSize = layout.size
          newPosition = layout.position
        } else if (!newMaximized && win.originalSize) {
          // Restore original size when un-maximizing
          newSize = win.originalSize
          // Keep current position or maybe we should have saved original position too?
          // For now, let's just restore size and keep it somewhat centered or where it is.
        }

        return {
          ...win,
          isMaximized: newMaximized,
          size: newSize,
          position: newPosition,
          originalSize: originalSize,
        }
      })
    )
  }

  const handleFolderClick = (folder: FileItem) => {
    // Buscar el proyecto en Firebase
    const project = projects.find((p) => p.id === folder.id)
    console.log("Proyecto seleccionado:", project)

    if (project && project.photos && project.photos.length > 0) {
      // Pasar objetos de foto con dimensiones si están disponibles
      const photoData = project.photos.map(p => ({
        url: p.url,
        width: p.width,
        height: p.height
      }))
      console.log("Fotos a abrir:", photoData)

      // Abrir efecto cascada con las fotos y sus dimensiones
      openVirusEffect(
        photoData,
        project.name
      )
    } else {
      console.log("Proyecto sin fotos o no encontrado:", folder.name)

      // Mostrar una alerta si no hay fotos
      const windowId = `error-${Date.now()}`
      const content = (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gray-100">
          <div className="text-center">
            <h3 className="font-bold mb-4 text-black">No hay contenido disponible</h3>
            <p className="text-gray-700">No se encontraron fotos para este proyecto.</p>
            <p className="text-gray-500 text-sm mt-2">ID: {folder.id}</p>
          </div>
        </div>
      )
      openCenteredWindow(`${folder.name} - Sin contenido`, content)
    }
  }

  const handleFileClick = (file: FileItem) => {
    console.log("Archivo clickeado:", file.name)
  }

  const handleDesignFolderClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Explorador KIKU - Diseño")) {
      console.log("Design explorer already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    // Configuramos el finder para mostrar específicamente la categoría de diseño
    const FinderWithDesignCategory = () => {
      const [initialCategory] = useState<"design" | "photography" | "general" | "all">("design");
      return <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} initialCategory={initialCategory} />;
    };

    openCenteredWindow("Explorador KIKU - Diseños", <FinderWithDesignCategory />, {
      width: isMobile ? Math.min(window.innerWidth - 20, 350) : 900,
      height: isMobile ? Math.min(window.innerHeight - 100, 500) : 700,
    })
  }

  const handlePhotoFolderClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Explorador KIKU - Fotografía")) {
      console.log("Photo explorer already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    // Configuramos el finder para mostrar específicamente la categoría de fotografía
    const FinderWithPhotoCategory = () => {
      const [initialCategory] = useState<"design" | "photography" | "video" | "general" | "all">("photography");
      return <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} initialCategory={initialCategory} />;
    };

    openCenteredWindow("Explorador KIKU - Fotografía", <FinderWithPhotoCategory />, {
      width: isMobile ? Math.min(window.innerWidth - 20, 350) : 900,
      height: isMobile ? Math.min(window.innerHeight - 100, 500) : 700,
    })
  }

  const handleVideoFolderClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Explorador KIKU - Videos")) {
      console.log("Video explorer already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    // Configuramos el finder para mostrar específicamente la categoría de video
    const FinderWithVideoCategory = () => {
      const [initialCategory] = useState<"design" | "photography" | "video" | "general" | "all">("video");
      return <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} initialCategory={initialCategory} />;
    };

    openCenteredWindow("Explorador KIKU - Videos", <FinderWithVideoCategory />, {
      width: isMobile ? Math.min(window.innerWidth - 20, 350) : 900,
      height: isMobile ? Math.min(window.innerHeight - 100, 500) : 700,
    })
  }

  const handleContactFolderClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Contact - KIKU")) {
      console.log("Contact window already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const contactContent = (
      <div className="p-4 md:p-6 bg-[#c0c0c0] h-full font-sans overflow-hidden">
        <div className="mx-auto h-full overflow-y-auto">
          <div className="bg-[#000080] text-white px-2 py-1 mb-4 font-bold text-sm">
            📧 Contact Form
          </div>

          <form className="space-y-2" onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const from = formData.get('from')
            const email = formData.get('email')
            const message = formData.get('message')

            // Crear mailto link
            const subject = `Message from ${from}`
            const body = `From: ${from}\nEmail: ${email}\n\nMessage:\n${message}`
            window.location.href = `mailto:kiku.creamm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
          }}>
            {/* Sending to */}
            <div className="bg-white border-2 border-[#808080] p-2" style={{ borderStyle: "inset" }}>
              <label className="block text-xs font-bold mb-1 text-black">Sending to:</label>
              <div className="bg-[#fff] border border-[#000] px-2 py-1">
                <span className="text-sm text-black font-mono">kiku.creamm@gmail.com</span>
              </div>
            </div>

            {/* From */}
            <div className="bg-white border-2 border-[#808080] p-2" style={{ borderStyle: "inset" }}>
              <label className="block text-xs font-bold mb-1 text-black">From:</label>
              <input
                type="text"
                name="from"
                required
                className="w-full border-2 border-[#7f7f7f] px-2 py-1 text-sm text-black bg-white focus:outline-none"
                style={{ borderStyle: "inset" }}
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div className="bg-white border-2 border-[#808080] p-3" style={{ borderStyle: "inset" }}>
              <label className="block text-xs font-bold mb-1 text-black">Email:</label>
              <input
                type="email"
                name="email"
                required
                className="w-full border-2 border-[#7f7f7f] px-2 py-1 text-sm text-black bg-white focus:outline-none"
                style={{ borderStyle: "inset" }}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Message */}
            <div className="bg-white border-2 border-[#808080] p-2" style={{ borderStyle: "inset" }}>
              <label className="block text-xs font-bold mb-1 text-black">Message:</label>
              <textarea
                name="message"
                required
                rows={6}
                className="w-full border-2 border-[#7f7f7f] px-2 py-1 text-sm text-black bg-white focus:outline-none resize-none font-mono"
                style={{ borderStyle: "inset" }}
                placeholder="Type your message here..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="submit"
                className="px-6 py-2 bg-[#c0c0c0] border-2 text-black text-sm font-bold hover:bg-[#d0d0d0] active:border-[#000] transition-colors"
                style={{ borderStyle: "outset" }}
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => closeWindow(`contact-${Date.now()}`)}
                className="px-6 py-2 bg-[#c0c0c0] border-2 text-black text-sm font-bold hover:bg-[#d0d0d0] active:border-[#000] transition-colors"
                style={{ borderStyle: "outset" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
    openCenteredWindow("Contact - KIKU", contactContent, {
      width: isMobile ? Math.min(window.innerWidth * 0.85, 320) : 600,
      height: isMobile ? Math.min(window.innerHeight * 0.7, 500) : 650,
    })
  }

  const handleDrawingAppOpen = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "KIKU Paint")) {
      console.log("Drawing app already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const drawingContent = <DrawingApp />
    openCenteredWindow("KIKU Paint", drawingContent, {
      width: isMobile ? Math.min(window.innerWidth * 0.85, 320) : 1000,
      height: isMobile ? Math.min(window.innerHeight * 0.65, 450) : 700,
    })
  }

  const handleAboutClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "About - KIKU CREAM")) {
      console.log("About window already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    const aboutTexts = {
      es: `Kiku Cream es un estudio creativo multidisciplinario fundado en 2023. Su nombre proviene de la palabra japonesa kiku (菊), que significa crisantemo —una flor asociada con el sol y adoptada como emblema de la familia imperial japonesa. Simboliza poder, luz y fortaleza, pero también evoca la idea de la belleza en transición: aquella que cambia, se transforma, envejece, se quiebra y, a veces, se desvanece. En Kiku Cream no buscamos la belleza clásica; perseguimos una estética transparente, honesta, cruda y emocional.

Kiku encarna la esencia de nuestro enfoque creativo: un lenguaje visual impulsado por la intensidad y la vitalidad, donde la luz y el color no son simples herramientas técnicas, sino verdaderos protagonistas narrativos. Nuestra estética abraza el contraste y una sensibilidad que une la expresión cultural y emocional a través de una mirada contemporánea.

Ofrecemos servicios de dirección creativa y producción integral, así como de diseño gráfico, fotografía, edición y corrección de color. Cada proyecto se aborda con una mentalidad transversal, combinando concepto y forma para crear piezas visuales que comuniquen, desafíen y transformen.

Colaboramos con marcas, proyectos artísticos y plataformas editoriales que buscan una identidad visual sólida, coherente y con propósito. Si tu proyecto requiere una dirección creativa con intención y presencia, estamos listos para construirla juntos.`,
      en: `Kiku Cream is a multidisciplinary creative studio founded in 2023. Its name comes from the Japanese word kiku (菊), meaning chrysanthemum — a flower associated with the sun and adopted as the emblem of the Japanese imperial family. It symbolizes power, light, and strength, but also evokes the idea of beauty in transition: one that changes, transforms, ages, breaks, and sometimes fades. At Kiku Cream, we don't seek classic beauty; we pursue an aesthetic that is transparent, honest, raw, and emotional.

Kiku embodies the essence of our creative approach: a visual language driven by intensity and vitality, where light and color are not mere technical tools but true narrative protagonists. Our aesthetic embraces contrast and a sensitivity that bridges cultural and emotional expression through a contemporary lens.

We offer services in creative direction and full-scale production, as well as graphic design, photography, editing, and color correction. Each project is approached with a transversal mindset, combining concept and form to create visual pieces that communicate, challenge, and transform.

We collaborate with brands, artistic projects, and editorial platforms seeking a visual identity that is solid, coherent, and purposeful. If your project requires creative direction with intention and presence, we are ready to build it together.`,
      it: `Kiku Cream è uno studio creativo multidisciplinare fondato nel 2023. Il suo nome deriva dalla parola giapponese kiku (菊), che significa crisantemo — un fiore associato al sole e adottato come emblema della famiglia imperiale giapponese. Simboleggia potere, luce e forza, ma evoca anche l'idea di una bellezza in transizione: quella che cambia, si trasforma, invecchia, si spezza e, a volte, svanisce. In Kiku Cream non cerchiamo la bellezza classica; perseguiamo un'estetica trasparente, onesta, grezza ed emotiva.

Kiku incarna l'essenza del nostro approccio creativo: un linguaggio visivo guidato dall'intensità e dalla vitalità, in cui luce e colore non sono semplici strumenti tecnici, ma veri protagonisti narrativi. La nostra estetica abbraccia il contrasto e una sensibilità che unisce espressione culturale ed emotiva attraverso uno sguardo contemporaneo.

Offriamo servizi di direzione creativa e produzione integrale, oltre a design grafico, fotografia, editing e correzione del colore. Ogni progetto è affrontato con una mentalità trasversale, combinando concetto e forma per creare opere visive che comunichino, sfidino e trasformino.

Collaboriamo con marchi, progetti artistici e piattaforme editoriali che cercano un'identità visiva solida, coerente e con uno scopo preciso. Se il tuo progetto richiede una direzione creativa con intenzione e presenza, siamo pronti a costruirla insieme.`
    }

    const AboutTerminal = () => {
      const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'it'>('es')
      const [displayedText, setDisplayedText] = useState('')
      const [isTyping, setIsTyping] = useState(false)
      const [showCursor, setShowCursor] = useState(true)

      useEffect(() => {
        // Cursor parpadeante
        const cursorInterval = setInterval(() => {
          setShowCursor(prev => !prev)
        }, 530)
        return () => clearInterval(cursorInterval)
      }, [])

      useEffect(() => {
        // Efecto de escritura
        setIsTyping(true)
        setDisplayedText('')
        const text = aboutTexts[selectedLang]
        let currentIndex = 0

        const typingInterval = setInterval(() => {
          if (currentIndex < text.length) {
            setDisplayedText(text.substring(0, currentIndex + 1))
            currentIndex++
          } else {
            setIsTyping(false)
            clearInterval(typingInterval)
          }
        }, 15) // Velocidad de escritura (15ms por carácter = relativamente rápido)

        return () => clearInterval(typingInterval)
      }, [selectedLang])

      return (
        <div className="h-full bg-black p-4 font-mono text-sm overflow-hidden flex flex-col">
          {/* Header estilo CMD */}
          <div className="bg-white text-black px-2 py-1 mb-2 text-xs flex justify-between items-center">
            <span>C:\KIKU\about.exe</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLang('es')}
                className={`px-2 py-0.5 ${selectedLang === 'es' ? 'bg-[#000080] text-white' : 'bg-gray-300'}`}
              >
                ES
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-2 py-0.5 ${selectedLang === 'en' ? 'bg-[#000080] text-white' : 'bg-gray-300'}`}
              >
                EN
              </button>
              <button
                onClick={() => setSelectedLang('it')}
                className={`px-2 py-0.5 ${selectedLang === 'it' ? 'bg-[#000080] text-white' : 'bg-gray-300'}`}
              >
                IT
              </button>
            </div>
          </div>

          {/* Terminal content */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-white mb-2">
              <span className="text-yellow-400">kiku@cream:~$</span> cat about.txt
            </div>
            <div className="text-white whitespace-pre-wrap leading-relaxed">
              {displayedText}
              {isTyping && showCursor && <span className="bg-white text-black">_</span>}
              {!isTyping && showCursor && <span className="text-white">█</span>}
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-xs mt-2 border-t border-gray-700 pt-2">
            {isTyping ? '⌨️  Typing...' : '✓ Complete'}
          </div>
        </div>
      )
    }

    const aboutContent = <AboutTerminal />
    openCenteredWindow("About - KIKU CREAM", aboutContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 700,
      height: isMobile ? Math.min(550, window.innerHeight * 0.85) : 600,
    })
    setIsMenuOpen(false)
  }

  const handleShopClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Shop - KIKU")) {
      console.log("Shop window already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const shopContent = <ShopGrid products={products} />
    
    openCenteredWindow("Shop - KIKU", shopContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 900,
      height: isMobile ? Math.min(500, window.innerHeight * 0.85) : 700,
    })
    setIsMenuOpen(false)
  }

  const handleJoinClick = () => {
    // Prevent duplicate windows
    if (windows.some(w => w.title === "Join KIKU CREAM")) {
      console.log("Join window already open")
      return
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    const joinTexts = {
      es: {
        title: "¡Únete al equipo!",
        content: `¿Tienes una idea que quieres desarrollar? ¿Sientes que nuestra estética te representa? ¿Te interesa formar parte de un proyecto creativo desde cero? ¿Diseñas, fotografías, grabas o produces contenido? ¿Simplemente te interesa?

En Kiku Cream estamos formando un equipo inicial y buscamos personas con visión, ganas de crecer y que disfruten del trabajo en equipo.

Si quieres sumarte al equipo creativo, contáctanos :)`
      },
      en: {
        title: "Join the team!",
        content: `Do you have an idea you want to develop? Do you feel that our aesthetic represents you? Are you interested in being part of a creative project from scratch? Do you design, photograph, film, or produce content? Or are you simply interested?

At Kiku Cream, we are forming an initial team and looking for people with vision, a desire to grow, and who enjoy working in a team.

If you want to join the creative team, contact us :)`
      },
      it: {
        title: "Unisciti al team!",
        content: `Hai un'idea che vuoi sviluppare? Senti che la nostra estetica ti rappresenta? Ti interessa far parte di un progetto creativo da zero? Disegni, fotografi, filmi o produci contenuti? O sei semplicemente interessato/a?

In Kiku Cream stiamo formando il team iniziale e cerchiamo persone con visione, voglia di crescere e che amino lavorare in team.

Se vuoi unirti al team creativo, contattaci :)`
      }
    }

    const JoinContent = () => {
      const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'it'>('es')

      return (
        <div className="p-6 md:p-8 bg-[#c0c0c0] h-full overflow-y-auto font-sans">
          <div className=" mx-auto">
            {/* Header con selector de idioma */}
            <div className="flex flex-col justify-center items-center mb-6 flex-wrap gap-1">
              <div className="bg-[#000080] text-white px-3 py-2 font-bold text-base">
                ⭐ {joinTexts[selectedLang].title}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedLang('es')}
                  className={`px-3 py-1 text-xs font-bold border-2 ${selectedLang === 'es' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-black border-[#808080]'}`}
                  style={{ borderStyle: "outset" }}
                >
                  ES
                </button>
                <button
                  onClick={() => setSelectedLang('en')}
                  className={`px-3 py-1 text-xs font-bold border-2 ${selectedLang === 'en' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-black border-[#808080]'}`}
                  style={{ borderStyle: "outset" }}
                >
                  EN
                </button>
                <button
                  onClick={() => setSelectedLang('it')}
                  className={`px-3 py-1 text-xs font-bold border-2 ${selectedLang === 'it' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-black border-[#808080]'}`}
                  style={{ borderStyle: "outset" }}
                >
                  IT
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="bg-white border-2 border-[#808080] p-6 " style={{ borderStyle: "inset" }}>
              <p className="text-black whitespace-pre-wrap leading-relaxed text-sm">
                {joinTexts[selectedLang].content}
              </p>
            </div>

            {/* Footer con botón de contacto */}
            <div className="mt-4 bg-[#dfdfdf] border-2 border-[#808080] p-4" style={{ borderStyle: "groove" }}>
              <p className="text-black font-bold text-sm mb-2">📱 Contacto:</p>
              <p className="text-xs text-gray-700">Instagram: @kiku.cream</p>
              <p className="text-xs text-gray-700">Email: kiku.creamm@gmail.com</p>
            </div>
          </div>
        </div>
      )
    }

    const joinContent = <JoinContent />
    openCenteredWindow("Únete a nosotros - KIKU", joinContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 550,
      height: isMobile ? Math.min(500, window.innerHeight * 0.85) : 520,
    })
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, ...updates } : window)))
  }

  const closeWindow = (id: string) => {
    // Limpiar el tracking de imagen usando el mapa
    const imagePath = windowToImageRef.current.get(id)
    if (imagePath) {
      openImagesRef.current.delete(imagePath)
      windowToImageRef.current.delete(id)
    }
    setWindows((prev) => prev.filter((window) => window.id !== id))
  }

  const bringToFront = (id: string) => {
    nextZIndexRef.current += 1
    const newZIndex = nextZIndexRef.current

    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, zIndex: newZIndex } : window)))
    setNextZIndex(newZIndex)
  }

  // Desktop: Todas las fotos en HD. Mobile: Solo las top 2 por z-index
  const photoWindows = windows.filter(w => w.id && w.id.startsWith('photo-') && !w.isMinimized)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  const top3PhotoIds = isMobile
    ? new Set(photoWindows.sort((a, b) => b.zIndex - a.zIndex).slice(0, 2).map(w => w.id))
    : new Set(photoWindows.map(w => w.id)) // Desktop: todas HD

  return (
    <div className="h-screen w-full bg-white p-[3px] box-border overflow-hidden">
      <div className="h-full w-full bg-[#2169fd] relative overflow-hidden border-[7px] border-black box-border">
        {/* Desktop: kiku.svg y nubes.svg superpuestos */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <Image
              src="/escritorio-inicio/kiku.svg"
              alt="Fondo kiku"
              width={1920}
              height={1080}
              className="absolute z-10 w-[130%] h-auto max-h-[130%] object-contain"
              priority
            />
            <Image
              src="/escritorio-inicio/nubes.svg"
              alt="Fondo nubes"
              width={400}
              height={400}
              className="absolute z-0 w-[130%] h-auto object-contain max-w-full max-h-[105%] pointer-events-none"
              priority
            />
          </div>
        </div>

        {/* Mobile: kiku.svg vertical a la izquierda y nubes.svg de fondo, nubes por delante */}
        <div className="md:hidden absolute inset-0 w-full h-full overflow-hidden">
          {/* KIKU ocupa todo el alto en móvil */}
          <div className="absolute inset-0 flex items-center left-0 top-0 z-10 justify-start">
            <Image
              src="/escritorio-celu/kiku.svg"
              alt="Fondo kiku móvil"
              width={600}
              height={2000}
              className="h-full max-h-full w-auto object-contain"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center right-0 top-0 z-10 justify-end mobile-nubes-container">
            <Image
              src="/escritorio-celu/kikunubes.svg"
              alt="Fondo kikunubes móvil"
              width={600}
              height={2000}
              className="h-full max-h-full w-auto object-contain mobile-kikunubes min-[380px]:mr-4"
              priority
            />
          </div>
        </div>

        {/* Logo KIKU - Desktop: arriba izquierda, Mobile: arriba derecha */}
        <div className="absolute top-3 left-1 md:left-1 md:top-3 md:block hidden z-[1000]">
          <Image
            src="/escritorio-inicio/kikulogo.svg"
            alt="Logo KIKU"
            width={60}
            height={60}
            className="object-contain w-[50px] h-[50px] md:w-[60px] md:h-[60px] lg:w-[80px] lg:h-[80px] cursor-pointer hover:scale-110 transition-transform"
            draggable={false}
            onClick={toggleMenu}
          />
          {/* Menú desplegable Desktop - Estilo Dinette */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-3 bg-black rounded-3xl shadow-2xl px-6 py-5 min-w-[280px] border-4 border-white"
              >
                <div className="space-y-1">
                  <button
                    onClick={handleAboutClick}
                    className="w-full text-left py-3 px-4 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-lg tracking-tight flex items-center gap-3 group border border-transparent hover:border-black"
                  >
                    <span className="text-white group-hover:text-black text-xl transition-colors">▶</span>
                    <span>¿Qué somos?</span>
                  </button>
                  <button
                    onClick={() => {
                      handleContactFolderClick()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left py-3 px-4 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-lg tracking-tight flex items-center gap-3 group border border-transparent hover:border-black"
                  >
                    <span className="text-white group-hover:text-black text-xl transition-colors">▶</span>
                    <span>Contacto</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open('https://www.instagram.com/kiku.cream/', '_blank')
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left py-3 px-4 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-lg tracking-tight flex items-center gap-3 group border border-transparent hover:border-black"
                  >
                    <span className="text-white group-hover:text-black text-xl transition-colors">▶</span>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={handleShopClick}
                    className="w-full text-left py-3 px-4 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-lg tracking-tight flex items-center gap-3 group border border-transparent hover:border-black"
                  >
                    <span className="text-white group-hover:text-black text-xl transition-colors">▶</span>
                    <span>Shop</span>
                  </button>
                  <button
                    onClick={handleJoinClick}
                    className="w-full text-left py-3 px-4 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-lg tracking-tight flex items-center gap-3 group border border-transparent hover:border-black"
                  >
                    <span className="text-white group-hover:text-black text-xl transition-colors">▶</span>
                    <span>Únete a nosotros</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-2 right-1 md:hidden z-[1000]">
          <Image
            src="/escritorio-celu/kikulogo.svg"
            alt="Logo KIKU"
            width={60}
            height={60}
            className="object-contain w-[60px] h-[60px] cursor-pointer hover:scale-110 transition-transform"
            draggable={false}
            onClick={toggleMenu}
          />
          {/* Menú desplegable Mobile - Estilo Dinette */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-3 bg-black rounded-3xl shadow-2xl px-3 py-2 min-w-[200px] border-4 border-white"
              >
                <div className="space-y-0.5">
                  <button
                    onClick={handleAboutClick}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z" />
                    </svg>
                    <span>¿Qué somos?</span>
                  </button>
                  <button
                    onClick={() => {
                      handleContactFolderClick()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z" />
                    </svg>
                    <span>Contacto</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open('https://www.instagram.com/kiku.cream/', '_blank')
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z" />
                    </svg>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={handleShopClick}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z" />
                    </svg>
                    <span>Shop</span>
                  </button>
                  <button
                    onClick={handleJoinClick}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z" />
                    </svg>
                    <span>Únete a nosotros</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contacto y Signos - Desktop: arriba derecha, Mobile: abajo derecha */}
        <div className="hidden md:flex absolute top-0 right-2 z-[200] flex-col items-end gap-0 pointer-events-auto">
          <Image
            src="/escritorio-inicio/contacto.svg"
            alt="Contacto"
            width={60}
            height={60}
            className="object-contain w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[65px] lg:h-[65px] cursor-pointer hover:scale-110 transition-transform pointer-events-auto -mb-4"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              handleContactFolderClick();
            }}
          />
          <Image
            src="/escritorio-inicio/signos.svg"
            alt="Abrir KIKU Paint"
            width={60}
            height={60}
            className="object-contain w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[65px] lg:h-[65px] cursor-pointer hover:scale-110 transition-transform pointer-events-auto"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              handleDrawingAppOpen();
            }}
          />
        </div>
        {/* Papelera Móvil - Centrada abajo, solo si hay ventanas y no son Contact o Drawing */}
        {windows.length > 0 && !windows.some(w => w.title === "Contact - KIKU" || w.title === "KIKU Paint" || w.title === "Únete a nosotros - KIKU" || w.title === "About - KIKU CREAM") && (
          <div
            className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              resetDesktop()
            }}
          >
            <Image
              src="/escritorio-celu/basura.svg"
              alt="Papelera"
              width={50}
              height={50}
              className="w-[40px] h-auto object-contain hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Container móvil con nubes.svg y botones - nubes SVG arriba en el DOM */}
        <div className="md:hidden absolute -bottom-1 right-1 flex flex-col items-end gap-0 pointer-events-none">

          <Image
            src="/escritorio-celu/nubes.svg"
            alt="Fondo nubes móvil"
            width={400}
            height={400}
            className="w-[185px] h-[185px] object-contain pointer-events-none mobile-nubes-bg z-[100]"
            priority
          />
          <Image
            src="/escritorio-celu/contacto.svg"
            alt="Contacto"
            width={60}
            height={60}
            className="object-contain w-[45px] h-[45px] cursor-pointer hover:scale-110 transition-transform pointer-events-auto z-[200]"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              handleContactFolderClick();
            }}
          />
          <Image
            src="/escritorio-celu/signos.svg"
            alt="Abrir KIKU Paint"
            width={60}
            height={60}
            className="object-contain w-[45px] h-[45px] cursor-pointer hover:scale-110 transition-transform -mt-4 pointer-events-auto z-[200]"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              handleDrawingAppOpen();
            }}
          />
        </div>

        {/* Nubes interactivas (desktop y mobile) */}
        <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 lg:gap-16 p-0 md:p-8 h-full overflow-hidden relative z-[150]">
          {/* ...existing code for interactive nubes (motion.divs)... */}
          <motion.div
            className="absolute cursor-pointer group nube-pos-1"
            drag
            dragElastic={0.1}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              // Animación de flotación sin interferir con el drag
              originX: 0.5,
              originY: 0.5,
            }}
            onClick={(e) => {
              if (!isDragging) {
                handleDesignFolderClick();
              }
            }}
          >
            <motion.div
              initial={{ y: 0, rotate: 0 }}
              animate={!isDragging ? {
                y: [0, -8, -12, -8, 0],
                rotate: [0, 2, 0, -2, 0],
              } : {}}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Desktop image */}
              <Image
                src="/escritorio-inicio/NUBE 1 COMPU.svg"
                alt="Carpeta Diseños"
                width={310}
                height={310}
                className="hidden md:block object-contain group-hover:drop-shadow-3xl transition-all duration-300 md:w-[220px] lg:w-[280px] xl:w-[380px]"
                draggable={false}
              />
              {/* Mobile image */}
              <Image
                src="/escritorio-celu/NUBE 1 CELU.svg"
                alt="Carpeta Diseños"
                width={180}
                height={0}
                className="md:hidden object-contain group-hover:drop-shadow-3xl transition-all duration-300 nube-1-mobile-size h-auto"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute cursor-pointer group nube-pos-2"
            drag
            dragElastic={0.1}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isDragging) {
                handlePhotoFolderClick();
              }
            }}
          >
            <motion.div
              initial={{ y: 0, rotate: 0 }}
              animate={!isDragging ? {
                y: [0, -10, -15, -10, 0],
                rotate: [0, -2, 0, 2, 0],
              } : {}}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Desktop image */}
              <Image
                src="/escritorio-inicio/NUBE 2 COMPU.svg"
                alt="Carpeta Fotografía"
                width={460}
                height={460}
                className="hidden md:block object-contain group-hover:drop-shadow-3xl transition-all duration-300 md:w-[300px] lg:w-[380px] xl:w-[460px]"
                draggable={false}
              />
              {/* Mobile image */}
              <Image
                src="/escritorio-celu/NUBE 2 CELU.svg"
                alt="Carpeta Fotografía"
                width={180}
                height={0}
                className="md:hidden object-contain group-hover:drop-shadow-3xl transition-all duration-300 nube-2-mobile-size h-auto"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute cursor-pointer group nube-pos-3 z-[200]"
            drag
            dragElastic={0.1}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              originX: 0.5,
              originY: 0.5,
            }}
            onClick={() => {
              if (!isDragging) {
                handleVideoFolderClick();
              }
            }}
          >
            <motion.div
              initial={{ y: 0, rotate: 0 }}
              animate={!isDragging ? {
                y: [0, -10, -14, -8, 0],
                rotate: [0, -2, 0, 2, 0],
              } : {}}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Desktop image */}
              <Image
                src="/escritorio-inicio/NUBE 3 COMPU.svg"
                alt="Carpeta Contacto"
                width={450}
                height={450}
                className="hidden md:block object-contain group-hover:drop-shadow-3xl transition-all duration-300 md:w-[290px] lg:w-[370px] xl:w-[450px]"
                draggable={false}
              />
              {/* Mobile image */}
              <Image
                src="/escritorio-celu/NUBE 3 CELU.svg"
                alt="Carpeta Video"
                width={240}
                height={0}
                className="md:hidden object-contain group-hover:drop-shadow-3xl transition-all duration-300 nube-3-mobile-size h-auto"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Papelera Desktop */}
        <div
          className="hidden md:block absolute bottom-6 right-6 z-[9999] cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // Cerrar todas las ventanas
            resetDesktop()
          }}
        >
          <Image
            src="/escritorio-inicio/basura.svg"
            alt="Papelera"
            width={80}
            height={80}
            className="w-[55px] h-auto object-contain group-hover:scale-105 transition-transform drop-shadow-lg"
          />
        </div>

        {/* Ventanas flotantes (RetroWindow) */}
        <AnimatePresence>
          {windows.map((win) => {
            // Determinar si esta ventana debe ser HD
            const isPhoto = win.id.startsWith('photo-')
            const shouldBeHighQuality = isPhoto && top3PhotoIds.has(win.id)

            // Inyectar prop isHighQuality si es ventana de foto
            let windowContent = win.content
            if (isPhoto && React.isValidElement(windowContent)) {
              windowContent = React.cloneElement(windowContent as React.ReactElement, {
                isHighQuality: shouldBeHighQuality
              } as any)
            }

            const isMobile = typeof window !== "undefined" && window.innerWidth < 768

            return (
              <ErrorBoundary key={win.id}>
                <RetroWindow
                  id={win.id}
                  title={win.title}
                  isMinimized={win.isMinimized}
                  isMaximized={win.isMaximized}
                  position={win.position}
                  size={win.size}
                  zIndex={win.zIndex}
                  onClose={() => closeWindow(win.id)}
                  onMinimize={() => updateWindow(win.id, { isMinimized: !win.isMinimized })}
                  onMaximize={() => handleMaximizeWindow(win.id)}
                  onMove={(newPosition) => updateWindow(win.id, { position: newPosition })}
                  onResize={(newSize) => updateWindow(win.id, { size: newSize })}
                  onFocus={() => bringToFront(win.id)}
                  preserveAspect={win.preserveAspect}
                  aspectRatio={win.aspectRatio}
                  backgroundTransparent={win.backgroundTransparent}
                >
                  {windowContent}
                </RetroWindow>
              </ErrorBoundary>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
