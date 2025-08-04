"use client"

import type React from "react"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"

interface StickerProps {
  id: string
  src: string
  alt: string
  initialPosition: { x: number; y: number }
  size?: number
  onDoubleClick?: (id: string) => void
}

export default function Sticker({ id, src, alt, initialPosition, size = 100, onDoubleClick }: StickerProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const clickTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
      onDoubleClick?.(id) // Double click detected
    } else {
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null
      }, 300) // Adjust double-click speed
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.current.x
      const newY = e.clientY - dragOffset.current.y
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1000 : 1, // Bring to front when dragging
      }}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size}
        height={size}
        className="pixelated drop-shadow-lg"
        draggable={false}
      />
    </motion.div>
  )
}
