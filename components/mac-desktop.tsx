"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import RetroWindow from "./retro-window"
import Finder from "./finder"
import TopMenuBar from "./top-menu-bar"
import DraggableDesktopIcon from "./draggable-desktop-icon"
import DrawingApp from "./drawing-app"

import "../styles/nube-pos.css"
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

  // Función para resetear el escritorio (cerrar todas las ventanas)
  const resetDesktop = () => {
    setWindows([])
    setNextZIndex(100)
  }

  // Función para obtener dimensiones de imagen - COMPLETAMENTE CORREGIDA
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image() // Usar window.Image para acceder al constructor nativo
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

    if (typeof window !== "undefined") {
      if (centered) {
        // Asegurarnos de que las ventanas centradas estén realmente en el centro
        position = {
          x: Math.max(0, Math.floor((window.innerWidth - defaultSize.width) / 2)),
          y: Math.max(0, Math.floor((window.innerHeight - defaultSize.height) / 2)),
        }
        console.log("Ventana centrada en:", position);
      } else if (!isMobile) {
        // En dispositivos no móviles, posición aleatoria para efecto cascada
        position = {
          x: Math.floor(Math.random() * Math.max(0, window.innerWidth - defaultSize.width - 50) + 25),
          y: Math.floor(Math.random() * Math.max(0, window.innerHeight - defaultSize.height - 100) + 50),
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
        
        // Aseguramos que el tamaño de la ventana se adapte exactamente a la imagen
        // para evitar bandas negras
        const windowDimensions = {
          width: dimensions.width + 4, // Añadimos un pequeño padding
          height: dimensions.height + 4, // para la ventana
        };

        const content = (
          <div className="w-full h-full flex items-center justify-center bg-black p-0">
            <Image
              src={imagePath || "/placeholder.svg"}
              alt={title}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full object-contain"
              priority={true}
              quality={100}
              onError={(e) => {
                console.error("Error loading image in window:", imagePath)
              }}
            />
          </div>
        )

        createWindow(windowId, title, content, false, windowDimensions)
      } catch (error) {
        console.error("Error creating photo window:", error)
        // Crear ventana con dimensiones por defecto si hay error
        const windowId = `photo-${Date.now()}-${Math.random()}`
        const content = (
          <div className="w-full h-full flex items-center justify-center bg-black p-2">
            <div className="text-white text-center">
              <p>Error cargando imagen</p>
              <p className="text-sm">{title}</p>
              <p className="text-xs mt-2">URL: {imagePath}</p>
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
    
    // Validar que todas las URLs sean cadenas de texto válidas
    const validImages = images.filter(url => typeof url === 'string' && url.trim() !== '');
    
    console.log(`Abriendo cascada de ${validImages.length} imágenes para el proyecto "${projectName}"`);
    
    if (validImages.length === 0) {
      // Mostrar mensaje si no hay imágenes válidas
      const content = (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gray-100">
          <div className="text-center">
            <h3 className="font-bold mb-4 text-black">No hay imágenes disponibles</h3>
            <p className="text-gray-700">No se encontraron URLs válidas para este proyecto.</p>
            <p className="text-gray-500 text-sm mt-2">Proyecto: {projectName}</p>
          </div>
        </div>
      );
      openCenteredWindow(`${projectName} - Sin imágenes`, content);
      return;
    }

    // Abrir cada imagen con un efecto de cascada
    validImages.forEach((imagePath, index) => {
      // Extraer un nombre para la imagen desde la URL
      const fileName = imagePath.split("/").pop()?.split(".")[0] || `Imagen ${index + 1}`
      // Crear ventana para cada foto con el delay correspondiente
      createPhotoWindow(imagePath, `${projectName} - ${fileName}`, index * actualDelay)
    })
  }

  const handleFolderClick = (folder: FileItem) => {
    // Buscar el proyecto en Firebase
    const project = projects.find((p) => p.id === folder.id)
    console.log("Proyecto seleccionado:", project)

    if (project && project.photos && project.photos.length > 0) {
      // Extraer las URLs de las fotos del proyecto en Firebase
      const photoUrls = project.photos.map(p => p.url)
      console.log("URLs de fotos:", photoUrls)
      
      // Abrir efecto cascada con las URLs
      openVirusEffect(
        photoUrls,
        project.name,
        150,
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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    // Configuramos el finder para mostrar específicamente la categoría de diseño
    const FinderWithDesignCategory = () => {
      const [initialCategory] = useState<"design" | "photography" | "general" | "all">("design");
      return <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} initialCategory={initialCategory} />;
    };
    
    openCenteredWindow("Explorador KIKU - Diseños", <FinderWithDesignCategory />, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 900,
      height: isMobile ? Math.min(500, window.innerHeight * 0.8) : 700,
    })
  }

  const handlePhotoFolderClick = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    // Configuramos el finder para mostrar específicamente la categoría de fotografía
    const FinderWithPhotoCategory = () => {
      const [initialCategory] = useState<"design" | "photography" | "general" | "all">("photography");
      return <Finder onFileClick={handleFileClick} onFolderClick={handleFolderClick} initialCategory={initialCategory} />;
    };
    
    openCenteredWindow("Explorador KIKU - Fotografía", <FinderWithPhotoCategory />, {
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
    <div className="h-screen w-full bg-[#2169fd] relative overflow-hidden border-[7px] border-black box-border">
      {/* kiku.svg y nubes.svg superpuestos */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <Image
          src="/escritorio-inicio/kiku.svg"
          alt="Fondo kiku"
          width={1920}
          height={1080}
          className="absolute w-[130%] h-auto max-h-[130%] object-contain"
          priority
        />
        <Image
          src="/escritorio-inicio/nubes.svg"
          alt="Fondo nubes"
          width={400}
          height={400}
          className="absolute w-[140%] h-auto object-contain max-w-full max-h-[105%]"
          priority
        />
      </div>
      
      {/* Logo KIKU en la esquina superior izquierda */}
      <div className="absolute top-3 left-1 z-[1000]">
        <Image
          src="/escritorio-inicio/kikulogo.svg"
          alt="Logo KIKU"
          width={60}
          height={60}
          className="object-contain w-[50px] h-[50px] md:w-[60px] md:h-[60px] lg:w-[80px] lg:h-[80px] cursor-pointer hover:scale-110 transition-transform"
          draggable={false}
          onClick={resetDesktop}
        />
      </div>

      {/* Contacto en la esquina superior derecha */}
      <div className="absolute right-2 z-20 flex flex-col items-end">
        <Image
          src="/escritorio-inicio/contacto.svg"
          alt="Contacto"
          width={60}
          height={60}
          className="object-contain w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[65px] lg:h-[65px] cursor-pointer hover:scale-110 transition-transform"
          draggable={false}
        />
        <Image
          src="/escritorio-inicio/signos.svg"
          alt="Qué es Kiku Cream"
          width={60}
          height={60}
          className="object-contain w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[65px] lg:h-[65px] cursor-pointer hover:scale-110 transition-transform -mt-2 md:-mt-4"
          draggable={false}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 lg:gap-16 p-4 md:p-8 h-full overflow-y-auto md:overflow-hidden relative z-10">
        <motion.div
          className="absolute cursor-pointer group nube-pos-1"
          drag
          dragMomentum={false}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={(e) => {
            // Guardamos la posición inicial del clic
            const startPos = { x: e.clientX, y: e.clientY };
            
            const handleMouseUp = (e: MouseEvent) => {
              // Calculamos la distancia arrastrada
              const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - startPos.x, 2) + 
                Math.pow(e.clientY - startPos.y, 2)
              );
              
              // Solo activamos el clic si la distancia es pequeña (menos de 5 píxeles)
              if (distanceMoved < 5) {
                handleDesignFolderClick();
              }
              
              // Limpiamos el evento
              window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <Image
            src="/escritorio-inicio/NUBE 1 COMPU.svg"
            alt="Carpeta Diseños"
            width={310}
            height={310}
            className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[180px]  md:w-[220px]  lg:w-[280px]  xl:w-[310px] "
            draggable={false}
          />
        </motion.div>

        <div className="absolute nube-pos-2">
          <motion.div
            className="cursor-pointer group"
            drag
            dragMomentum={false}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={(e) => {
              // Guardamos la posición inicial del clic
              const startPos = { x: e.clientX, y: e.clientY };
              
              const handleMouseUp = (e: MouseEvent) => {
                // Calculamos la distancia arrastrada
                const distanceMoved = Math.sqrt(
                  Math.pow(e.clientX - startPos.x, 2) + 
                  Math.pow(e.clientY - startPos.y, 2)
                );
                
                // Solo activamos el clic si la distancia es pequeña (menos de 5 píxeles)
                if (distanceMoved < 5) {
                  handlePhotoFolderClick();
                }
                
                // Limpiamos el evento
                window.removeEventListener('mouseup', handleMouseUp);
              };
              
              window.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <Image
              src="/escritorio-inicio/NUBE 2 COMPU.svg"
              alt="Carpeta Fotografía"
              width={460}
              height={460}
              className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[240px]  md:w-[300px]  lg:w-[380px]  xl:w-[460px]"
              draggable={false}
            />
          </motion.div>
        </div>

        <motion.div
          className="absolute cursor-pointer group nube-pos-3"
          drag
          dragMomentum={false}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={(e) => {
            // Guardamos la posición inicial del clic
            const startPos = { x: e.clientX, y: e.clientY };
            
            const handleMouseUp = (e: MouseEvent) => {
              // Calculamos la distancia arrastrada
              const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - startPos.x, 2) + 
                Math.pow(e.clientY - startPos.y, 2)
              );
              
              // Solo activamos el clic si la distancia es pequeña (menos de 5 píxeles)
              if (distanceMoved < 5) {
                handleContactFolderClick();
              }
              
              // Limpiamos el evento
              window.removeEventListener('mouseup', handleMouseUp);
            };
            
            window.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <Image
            src="/escritorio-inicio/NUBE 3 COMPU.svg"
            alt="Carpeta Contacto"
            width={450}
            height={450}
            className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[230px]  md:w-[290px]  lg:w-[370px]  xl:w-[450px] "
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
