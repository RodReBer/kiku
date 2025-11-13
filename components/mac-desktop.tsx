"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import RetroWindow from "./retro-window"
import Finder from "./finder"
import DraggableDesktopIcon from "./draggable-desktop-icon"
import DrawingApp from "./drawing-app"

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
}

export default function MacDesktop() {
  const { projects } = useData()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(3000) // Base alto para ventanas (por encima de UI)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const imageCache = useRef<Map<string, { width: number; height: number }>>(new Map())

  // Scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Función para resetear el escritorio (cerrar todas las ventanas)
  const resetDesktop = () => {
    setWindows([])
    setNextZIndex(3000)
  }

  // Función para obtener dimensiones de imagen - OPTIMIZADA con cache
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    // Verificar si ya tenemos las dimensiones en cache
    if (imageCache.current.has(src)) {
      return Promise.resolve(imageCache.current.get(src)!)
    }

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

          const dimensions = { width: Math.round(width), height: Math.round(height) }
          // Guardar en cache para evitar recargas
          imageCache.current.set(src, dimensions)
          resolve(dimensions)
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
      if (centered || isMobile) {
        // En móvil SIEMPRE centrar, en desktop solo si se especifica centered
        position = {
          x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
          y: Math.max(40, (window.innerHeight - defaultSize.height) / 2),
        }
      } else {
        // En desktop no centrado, posición aleatoria para efecto cascada
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

  const createPhotoWindow = (imagePath: string, title: string, delay = 0, index = 0) => {
    setTimeout(async () => {
      try {
        const windowId = `photo-${Date.now()}-${Math.random()}`
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768

        // Obtener dimensiones de forma segura
        const dimensions = await getImageDimensions(imagePath)

        // Dimensiones responsivas para las ventanas de fotos
        let windowDimensions
        if (isMobile) {
          // En móvil: ventanas más pequeñas para que quepan varias
          const maxWidth = Math.min(280, window.innerWidth * 0.7)
          const maxHeight = Math.min(350, window.innerHeight * 0.5)
          const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height, 1)
          windowDimensions = {
            width: Math.round(dimensions.width * scale),
            height: Math.round(dimensions.height * scale),
          }
        } else {
          // En desktop: ventanas más grandes
          const maxWidth = Math.min(500, window.innerWidth * 0.4)
          const maxHeight = Math.min(600, window.innerHeight * 0.6)
          const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height, 1)
          windowDimensions = {
            width: Math.round(dimensions.width * scale),
            height: Math.round(dimensions.height * scale),
          }
        }

        // Posición aleatoria desperdigada por toda la pantalla
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Generar posición completamente aleatoria - MÁS dispersión
        // Usar el índice para agregar más variación y evitar superposiciones
        const minMargin = isMobile ? 10 : 20
        const maxX = viewportWidth - windowDimensions.width - minMargin
        const maxY = viewportHeight - windowDimensions.height - minMargin - 60
        
        // Múltiples seeds aleatorios para mayor dispersión
        const randomSeedX = Math.random() + (index * 0.789) + Math.sin(index * 2.5) * 0.3
        const randomSeedY = Math.random() + (index * 0.654) + Math.cos(index * 3.2) * 0.3
        
        const randomX = Math.max(minMargin, (Math.abs(randomSeedX) % 1) * Math.max(maxX, minMargin))
        const randomY = Math.max(60, (Math.abs(randomSeedY) % 1) * Math.max(maxY, 60))

        const content = (
          <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
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

        // Crear ventana con posición aleatoria y z-index dinámico
        const photoWindow: WindowState = {
          id: windowId,
          title,
          content,
          isMinimized: false,
          isMaximized: false,
          position: { x: randomX, y: randomY },
          size: windowDimensions,
          zIndex: nextZIndex + index, // z-index dinámico que se incrementa
        }

        setWindows((prev) => [...prev, photoWindow])
        setNextZIndex((prev) => prev + 1)
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
      // Crear ventana para cada foto con el delay correspondiente y el índice para z-index
      createPhotoWindow(imagePath, `${projectName} - ${fileName}`, index * actualDelay, index)
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
      width: isMobile ? Math.min(window.innerWidth - 20, 350) : 900,
      height: isMobile ? Math.min(window.innerHeight - 100, 500) : 700,
    })
  }

  const handlePhotoFolderClick = () => {
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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const contactContent = (
      <div className="p-4 md:p-6 bg-[#c0c0c0] h-full overflow-y-auto font-sans">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#000080] text-white px-2 py-1 mb-4 font-bold text-sm">
            📧 Contact Form
          </div>
          
          <form className="space-y-4" onSubmit={(e) => {
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
            <div className="bg-white border-2 border-[#808080] p-3" style={{ borderStyle: "inset" }}>
              <label className="block text-xs font-bold mb-1 text-black">Sending to:</label>
              <div className="bg-[#fff] border border-[#000] px-2 py-1">
                <span className="text-sm text-black font-mono">kiku.creamm@gmail.com</span>
              </div>
            </div>

            {/* From */}
            <div className="bg-white border-2 border-[#808080] p-3" style={{ borderStyle: "inset" }}>
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
            <div className="bg-white border-2 border-[#808080] p-3" style={{ borderStyle: "inset" }}>
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
            <div className="flex gap-2 justify-end pt-2">
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

          <div className="mt-6 bg-[#dfdfdf] border-2 border-[#808080] p-3 text-xs text-black" style={{ borderStyle: "groove" }}>
            <p className="font-bold mb-1">📱 Also find me on:</p>
            <p>Instagram: @kiku.cream</p>
            <p>Response time: 24-48 hours</p>
          </div>
        </div>
      </div>
    )
    openCenteredWindow("Contact - KIKU", contactContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 600,
      height: isMobile ? Math.min(550, window.innerHeight * 0.85) : 650,
    })
  }

  const handleDrawingAppOpen = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const drawingContent = <DrawingApp />
    openCenteredWindow("KIKU Paint", drawingContent, {
      width: isMobile ? Math.min(window.innerWidth - 10, 420) : 1000,
      height: isMobile ? Math.min(window.innerHeight - 50, 650) : 700,
    })
  }

  const handleAboutClick = () => {
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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const shopContent = (
      <div className="p-6 md:p-8 bg-[#c0c0c0] h-full overflow-y-auto font-sans flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-[#000080] text-white px-3 py-2 mb-6 font-bold text-base inline-block">
            🛍️ SHOP
          </div>
          
          <div className="bg-white border-2 border-[#808080] p-8" style={{ borderStyle: "inset" }}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-black mb-4">Coming Soon...</h2>
            <p className="text-black mb-6">
              Nuestra tienda online está en construcción. Pronto podrás comprar prints, stickers y productos exclusivos de KIKU.
            </p>
            
            <div className="bg-yellow-200 border-2 border-yellow-400 p-4" style={{ borderStyle: "outset" }}>
              <p className="text-black font-bold text-sm">⏳ Disponible próximamente</p>
              <p className="text-xs text-gray-700 mt-1">Mientras tanto, contáctanos para pedidos personalizados</p>
            </div>
          </div>
        </div>
      </div>
    )
    openCenteredWindow("Shop - KIKU", shopContent, {
      width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 550,
      height: isMobile ? Math.min(450, window.innerHeight * 0.85) : 500,
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
    setWindows((prev) => prev.filter((window) => window.id !== id))
  }

  const bringToFront = (id: string) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, zIndex: nextZIndex } : window)))
    setNextZIndex((prev) => prev + 1)
  }

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
              className="h-full max-h-full w-auto object-contain mobile-kikunubes"
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
                      <path d="M7 4l10 8-10 8z"/>
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
                      <path d="M7 4l10 8-10 8z"/>
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
                      <path d="M7 4l10 8-10 8z"/>
                    </svg>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={handleShopClick}
                    className="w-full text-left py-2 px-2 text-white bg-black hover:bg-white hover:text-black transition-all duration-200 rounded-xl font-black text-sm tracking-tight flex items-center gap-2 group border border-transparent hover:border-black"
                  >
                    <svg className="w-4 h-4 text-white group-hover:text-black transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4l10 8-10 8z"/>
                    </svg>
                    <span>Shop</span>
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

        {/* Ventanas flotantes (RetroWindow) */}
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
    </div>
  )
}
