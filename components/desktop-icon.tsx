"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"

interface DesktopIconProps {
  id: string
  name: string
  icon: string
  onClick: () => void
  initialPosition: { x: number; y: number }
}

export default function DesktopIcon({ id, name, icon, onClick, initialPosition }: DesktopIconProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)

  const dragDataRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()

      dragDataRef.current = {
        isDragging: true,
        hasMoved: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      }

      setIsDragging(true)

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragDataRef.current.isDragging) return

        const deltaX = Math.abs(e.clientX - dragDataRef.current.startX)
        const deltaY = Math.abs(e.clientY - dragDataRef.current.startY)

        if (deltaX > 5 || deltaY > 5) {
          dragDataRef.current.hasMoved = true

          const newX = e.clientX - dragDataRef.current.offsetX
          const newY = e.clientY - dragDataRef.current.offsetY

          setPosition({
            x: Math.max(0, Math.min(newX, window.innerWidth - 100)),
            y: Math.max(0, Math.min(newY, window.innerHeight - 120)),
          })
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)

        // Solo ejecutar onClick si NO se movió el ícono
        if (!dragDataRef.current.hasMoved) {
          onClick()
        }

        dragDataRef.current.isDragging = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [onClick],
  )

  return (
    <div
      className={`absolute flex flex-col items-center cursor-pointer select-none ${
        isDragging ? "cursor-grabbing z-50" : "cursor-grab z-10"
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: "100px", // Más ancho para íconos más grandes
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`w-16 h-16 mb-2 flex items-center justify-center transition-all duration-200 ${
          isDragging ? "scale-110" : "hover:scale-105"
        }`}
      >
        <Image
          src={icon || "/placeholder.svg"}
          alt={name}
          width={64} // Íconos más grandes
          height={64}
          className="pixelated object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>
      <span
        className="text-sm text-white text-center leading-tight font-bold px-2 py-1 rounded max-w-full break-words"
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)",
          wordWrap: "break-word",
          maxWidth: "100px",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        {name}
      </span>
    </div>
  )
}
