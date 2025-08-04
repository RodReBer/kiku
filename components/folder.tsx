"use client"

import type React from "react"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"

interface FolderProps {
  id: string
  name: string
  iconSrc: string
  onDoubleClick: (id: string) => void
  initialPosition?: { x: number; y: number }
}

export default function Folder({ id, name, iconSrc, onDoubleClick, initialPosition = { x: 0, y: 0 } }: FolderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
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
      onDoubleClick(id) // Double click detected
      setIsClicked(false) // Reset click state
    } else {
      setIsClicked(true)
      clickTimeout.current = setTimeout(() => {
        setIsClicked(false)
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
      className={`absolute flex flex-col items-center p-2 cursor-pointer select-none ${
        isClicked ? "bg-blue-500 bg-opacity-50 border border-blue-700" : ""
      }`}
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
        src={iconSrc || "/placeholder.svg"}
        alt={name}
        width={64}
        height={64}
        className="pixelated drop-shadow-md"
        draggable={false}
      />
      <span className="text-white text-xs font-bold text-center mt-1 px-1 py-0.5 bg-black bg-opacity-50 rounded">
        {name}
      </span>
    </motion.div>
  )
}
