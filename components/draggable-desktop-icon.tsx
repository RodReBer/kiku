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

  // Eliminamos este método porque no lo necesitamos con el drag de framer-motion
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    if (!isDragging) {
      onClick()
    }
  }

  // Ajustamos para que no sea absoluto, sino relativo
  return (
    <motion.div
      ref={dragRef}
      className="cursor-pointer select-none group flex-shrink-0"
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <Image
        src={icon || "/placeholder.svg"}
        alt={name || "Icono"}
        width={280}
        height={280}
        className="object-contain group-hover:drop-shadow-3xl transition-all duration-300 w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]"
        draggable={false}
      />
      {name && (
        <span className="text-xs md:text-sm font-bold text-white text-center leading-tight drop-shadow-lg bg-black bg-opacity-50 px-2 py-1 rounded">
          {name}
        </span>
      )}
    </motion.div>
  )
}
