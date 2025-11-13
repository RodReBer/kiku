"use client"
import { useEffect, useState } from "react"
import DrawingTool from "./drawing-tool"

export default function DrawingApp() {
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // En móvil: expandir completamente usando toda la ventana disponible
        const width = window.innerWidth - 20
        const height = window.innerHeight - 100
        setDimensions({ width, height })
      } else {
        // En desktop: tamaño más grande
        setDimensions({ width: 900, height: 600 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <div className="w-full h-full flex items-start justify-center bg-gray-100 p-1 md:p-4">
      <DrawingTool width={dimensions.width} height={dimensions.height} />
    </div>
  )
}
