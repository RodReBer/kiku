"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface DraggableDesktopIconProps {
  name: string
  icon: string
  onClick: () => void
  initialX: number
  initialY: number
}

export default function DraggableDesktopIcon({ name, icon, onClick, initialX, initialY }: DraggableDesktopIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false)
    // Corregir el cálculo de posición para que el arrastre funcione correctamente
    const newX = Math.max(0, Math.min(position.x + info.offset.x, (window.innerWidth || 1200) - 100))
    const newY = Math.max(40, Math.min(position.y + info.offset.y, (window.innerHeight || 800) - 120))

    setPosition({ x: newX, y: newY })
  }

  const handleClick = () => {
    if (!isDragging) {
      onClick()
    }
  }

  return (
    <motion.div
      ref={dragRef}
      className="absolute cursor-pointer select-none z-10"
      style={{ left: position.x, top: position.y }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="flex flex-col items-center p-2 sm:p-3 hover:bg-blue-200 hover:bg-opacity-30 rounded transition-all duration-200 w-16 sm:w-20"
        onClick={handleClick}
      >
        {/* Icono sin fondo blanco - solo transparente */}
        <div className="mb-1 sm:mb-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
          <Image
            src={icon || "/placeholder.svg"}
            alt={name}
            width={32}
            height={32}
            className="pixelated sm:w-10 sm:h-10 drop-shadow-md"
            style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" }}
          />
        </div>
        <span className="text-xs sm:text-sm font-bold text-white text-center leading-tight drop-shadow-lg bg-black bg-opacity-50 px-2 py-1 rounded">
          {name}
        </span>
      </div>
    </motion.div>
  )
}
