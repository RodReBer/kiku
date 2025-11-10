"use client"
import { useEffect, useState } from "react"
import DrawingTool from "./drawing-tool"

export default function DrawingApp() {
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // En móvil: usar casi todo el espacio disponible
        const width = Math.min(window.innerWidth - 20, 400)
        const height = Math.min(window.innerHeight - 150, 500)
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
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-2 md:p-4">
      <DrawingTool width={dimensions.width} height={dimensions.height} />
    </div>
  )
}
