"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import RetroWindow from "./retro-window"
import Finder from "./finder"
import TopMenuBar from "./top-menu-bar"
import DrawingApp from "./drawing-app"
import { useData } from "@/context/data-context"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder" | "project"
  category: "design" | "photography" | "general"
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
}

export default function MacDesktop() {
  const { projects } = useData()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(100)

  // Función para obtener dimensiones de imagen - COMPLETAMENTE CORREGIDA
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = function () {
        try {
          // Usar 'this' para acceder a las propiedades de la imagen
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

          resolve({ width: Math.round(width), height: Math.round(height) })
        } catch (error) {
          console.error("Error processing image dimensions:", error)
          resolve({ width: 400, height: 300 })
        }
      }

      img.onerror = () => {
        console.error(`Error loading image: ${src}`)
        resolve({ width: 400, height: 300 })
      }

      img.src = src
    })
  }

  const createWindow = (
    id: string,
    title: string,
    content: React.ReactNode,
    centered = false,
    customSize?: { width: number; height: number },
  ) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const defaultSize = customSize || {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 800,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 600,
    }

    let position = { x: 10, y: 60 }

    if (typeof window !== "undefined" && !isMobile) {
      if (centered) {
        position = {
          x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
          y: Math.max(0, (window.innerHeight - defaultSize.height) / 2),
        }
      } else {
        position = {
          x: Math.random() * Math.max(0, window.innerWidth - defaultSize.width),
          y: Math.random() * Math.max(0, window.innerHeight - defaultSize.height),
        }
      }
    }

    const newWindow: WindowState = {
      id,
      title,
      content,
      isMinimized: false,
      isMaximized: false,
      position,
      size: defaultSize,
      zIndex: nextZIndex,
    }

    setWindows((prev) => [...prev, newWindow])
    setNextZIndex((prev) => prev + 1)
  }

  const openCenteredWindow = (title: string, content: React.ReactNode, size?: { width: number; height: number }) => {
    const windowId = `window-${Date.now()}-${Math.random()}`
    createWindow(windowId, title, content, true, size)
  }

  const createPhotoWindow = (imagePath: string, title: string, delay = 0) => {
    setTimeout(async () => {
      try {
        const windowId = `photo-${Date.now()}-${Math.random()}`

        // Obtener dimensiones de forma segura
        const dimensions = await getImageDimensions(imagePath)

        const content = (
          <div className="w-full h-full flex items-center justify-center bg-black p-2">
            <Image
              src={imagePath || "/placeholder.svg"}
              alt={title}
              width={dimensions.width}
              height={dimensions.height}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: "pixelated" }}
              onError={(e) => {
                console.error("Error loading image in window:", imagePath)
              }}
            />
          </div>
        )

        createWindow(windowId, title, content, false, dimensions)
      } catch (error) {
        console.error("Error creating photo window:", error)
        // Crear ventana con dimensiones por defecto si hay error
        const windowId = `photo-${Date.now()}-${Math.random()}`
        const content = (
          <div className="w-full h-full flex items-center justify-center bg-black p-2">
            <div className="text-white text-center">
              <p>Error cargando imagen</p>
              <p className="text-sm">{title}</p>
            </div>
          </div>
        )
        createWindow(windowId, title, content, false, { width: 400, height: 300 })
      }
    }, delay)
  }

  const openVirusEffect = (images: string[], projectName: string, delayBetween = 150) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const actualDelay = isMobile ? delayBetween * 2 : delayBetween

    images.forEach((imagePath, index) => {
      const fileName = imagePath.split("/").pop()?.split(".")[0] || `Imagen ${index + 1}`
      createPhotoWindow(imagePath, `${projectName} - ${fileName}`, index * actualDelay)
    })
  }

  const handleFolderClick = (folder: FileItem) => {
    const project = projects.find((p) => p.id === folder.id)

    if (project && project.photos && project.photos.length > 0) {
      openVirusEffect(
        project.photos.map((p) => p.url),
        project.name,
        150,
      )
    } else {
      console.log("Proyecto sin fotos o no encontrado:", folder.name)
    }
  }

  const handleFileClick = (file: FileItem) => {
    console.log("Archivo clickeado:", file.name)
  }

  const handleDesignFolderClick = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const finderContent = <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} />
    openCenteredWindow("Explorador KIKU - Diseños", finderContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 900,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 700,
    })
  }

  const handlePhotoFolderClick = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const finderContent = <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} />
    openCenteredWindow("Explorador KIKU - Fotografía", finderContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 900,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 700,
    })
  }

  const handleContactFolderClick = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const contactContent = (
      <div className="p-4 md:p-8 bg-gray-100 h-full font-mono overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center text-black">
            ═══ INFORMACIÓN DE CONTACTO ═══
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white p-4 md:p-6 border-2 border-gray-400" style={{ borderStyle: "inset" }}>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-black">📧 EMAIL</h3>
              <p className="text-black font-mono text-sm md:text-base">cat4rin4a@gmail.com</p>
              <div className="mt-2 text-xs text-gray-600">
                ┌─────────────────────────────────┐
                <br />│ Respuesta en 24-48 horas │<br />
                └─────────────────────────────────┘
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 border-2 border-gray-400" style={{ borderStyle: "inset" }}>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-black">📱 INSTAGRAM</h3>
              <p className="text-black font-mono text-sm md:text-base">@kiku.cream</p>
              <div className="mt-2 text-xs text-gray-600">
                ┌─────────────────────────────────┐
                <br />│ Portfolio visual y updates │<br />
                └─────────────────────────────────┘
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 border-2 border-gray-400" style={{ borderStyle: "inset" }}>
              <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-black">🌐 WEB</h3>
              <p className="text-black font-mono text-sm md:text-base">www.kiku-designs.retro</p>
              <div className="mt-2 text-xs text-gray-600">
                ┌─────────────────────────────────┐
                <br />│ Portfolio completo disponible │<br />
                └─────────────────────────────────┘
              </div>
            </div>

            <div
              className="bg-yellow-200 p-3 md:p-4 border-2 border-yellow-400 text-center"
              style={{ borderStyle: "outset" }}
            >
              <p className="text-black font-bold text-xs md:text-sm">⚡ DISPONIBLE PARA PROYECTOS CREATIVOS ⚡</p>
              <p className="text-xs text-gray-700 mt-1">Diseño gráfico • Ilustración • Branding</p>
            </div>
          </div>
        </div>
      </div>
    )
    openCenteredWindow("Contacto KIKU", contactContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 700,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 600,
    })
  }

  const handleDrawingAppOpen = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const drawingContent = <DrawingApp />
    openCenteredWindow("KIKU Paint", drawingContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 1000,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 700,
    })
  }

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, ...updates } : window)))
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id))
  }

  const bringToFront = (id: string) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, zIndex: nextZIndex } : window)))
    setNextZIndex((prev) => prev + 1)
  }

  return (
    <div className="h-screen w-full bg-[#ff0000] relative overflow-hidden">
      <TopMenuBar onOpenDrawingApp={handleDrawingAppOpen} />

      <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 lg:gap-16 p-4 md:p-8 h-full overflow-y-auto md:overflow-hidden">
        <motion.div
          className="relative cursor-pointer group flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDesignFolderClick}
        >
          <Image
            src="/folders/carpeta-diseno.png"
            alt="Carpeta Diseños"
            width={280}
            height={280}
            className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]"
            draggable={false}
          />

          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <Image
              src="/logo-kiku.png"
              alt="Logo KIKU"
              width={80}
              height={80}
              className="object-contain drop-shadow-lg w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[120px] lg:h-[120px]"
              draggable={false}
            />
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-[2.5rem] md:right-6">
            <Image
              src="/estrella-negra.png"
              alt="Estrella Negra"
              width={70}
              height={70}
              className="object-contain drop-shadow-lg w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[120px] lg:h-[120px]"
              draggable={false}
            />
          </div>
        </motion.div>

        <motion.div
          className="cursor-pointer group flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePhotoFolderClick}
        >
          <Image
            src="/folders/carpeta-foto.png"
            alt="Carpeta Fotografía"
            width={280}
            height={280}
            className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]"
            draggable={false}
          />
        </motion.div>

        <motion.div
          className="cursor-pointer group flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContactFolderClick}
        >
          <Image
            src="/folders/carpeta-contacto.png"
            alt="Carpeta Contacto"
            width={280}
            height={280}
            className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]"
            draggable={false}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {windows.map((window) => (
          <RetroWindow
            key={window.id}
            id={window.id}
            title={window.title}
            isMinimized={window.isMinimized}
            isMaximized={window.isMaximized}
            position={window.position}
            size={window.size}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => updateWindow(window.id, { isMinimized: !window.isMinimized })}
            onMaximize={() => updateWindow(window.id, { isMaximized: !window.isMaximized })}
            onMove={(newPosition) => updateWindow(window.id, { position: newPosition })}
            onResize={(newSize) => updateWindow(window.id, { size: newSize })}
            onFocus={() => bringToFront(window.id)}
          >
            {window.content}
          </RetroWindow>
        ))}
      </AnimatePresence>
    </div>
  )
}
