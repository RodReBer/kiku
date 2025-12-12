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
  const iconRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

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
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()

      dragDataRef.current = {
        isDragging: true,
        hasMoved: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      }

      setIsDragging(true)

      let latestX = position.x
      let latestY = position.y
      const originX = position.x
      const originY = position.y

      const applyTransform = () => {
        if (iconRef.current) {
          iconRef.current.style.transform = `translate(${latestX - originX}px, ${latestY - originY}px)`
        }
        rafRef.current = null
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragDataRef.current.isDragging) return
        const deltaX = Math.abs(e.clientX - dragDataRef.current.startX)
        const deltaY = Math.abs(e.clientY - dragDataRef.current.startY)
        if (deltaX > 5 || deltaY > 5) {
          dragDataRef.current.hasMoved = true
          const newX = e.clientX - dragDataRef.current.offsetX
          const newY = e.clientY - dragDataRef.current.offsetY
          latestX = Math.max(0, Math.min(newX, window.innerWidth - 100))
          latestY = Math.max(0, Math.min(newY, window.innerHeight - 120))
          if (rafRef.current == null) {
            rafRef.current = requestAnimationFrame(applyTransform)
          }
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        if (!dragDataRef.current.hasMoved) {
          onClick()
        } else {
          // Commit final position
          setPosition({ x: latestX, y: latestY })
        }
        if (iconRef.current) {
          iconRef.current.style.transform = ""
        }
        dragDataRef.current.isDragging = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove, { passive: true })
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
      ref={iconRef}
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
