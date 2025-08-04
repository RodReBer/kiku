"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"

interface WindowProps {
  id: string
  title: string
  children: React.ReactNode
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMaximized: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
  onResize: (width: number, height: number) => void
}

export default function Window({
  id,
  title,
  children,
  x,
  y,
  width,
  height,
  zIndex,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}: WindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevenir que el texto del título sea seleccionado durante el arrastre
    e.preventDefault()

    const target = e.target as HTMLElement
    // No iniciar arrastre si el click fue sobre un botón
    if (target.closest("button")) {
      return
    }

    onFocus() // Traer al frente al iniciar el arrastre
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWindowX = x
    const startWindowY = y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMaximized) {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY
        onMove(startWindowX + dx, Math.max(28, startWindowY + dy)) // 28 es aprox la altura del menubar
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <motion.div
      ref={windowRef}
      className="absolute bg-white rounded-t-lg shadow-2xl overflow-hidden flex flex-col"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseDown={onFocus} // Traer al frente al hacer click en cualquier parte de la ventana
    >
      {/* Window Header */}
      <div
        className="window-header h-8 bg-blue-500 border-b border-blue-600 flex items-center justify-between px-3 cursor-move select-none"
        onMouseDown={handleHeaderMouseDown} // Evento de arrastre solo en el header
      >
        <div className="flex items-center space-x-2">
          <button
            className="w-3.5 h-3.5 bg-red-500 rounded-full hover:bg-red-600 border border-red-700 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation() // Prevenir que onFocus del div padre se active
              onClose()
            }}
            aria-label="Cerrar ventana"
          />
          <button
            className="w-3.5 h-3.5 bg-yellow-500 rounded-full hover:bg-yellow-600 border border-yellow-700 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            aria-label="Minimizar ventana"
          />
          <button
            className="w-3.5 h-3.5 bg-green-500 rounded-full hover:bg-green-600 border border-green-700 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation()
              onMaximize()
            }}
            aria-label="Maximizar ventana"
          />
        </div>
        <div className="text-sm font-medium text-white flex-1 text-center truncate px-2">{title}</div>
        <div className="w-16" /> {/* Spacer para centrar el título si es necesario */}
      </div>

      {/* Window Content */}
      <div className="flex-1 h-full overflow-auto">{children}</div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
          style={{ background: "repeating-linear-gradient(45deg, #888, #888 2px, #ccc 2px, #ccc 4px)" }}
          onMouseDown={(e) => {
            e.stopPropagation()
            const startX = e.clientX
            const startY = e.clientY
            const startWidth = width
            const startHeight = height

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const dx = moveEvent.clientX - startX
              const dy = moveEvent.clientY - startY
              onResize(Math.max(300, startWidth + dx), Math.max(200, startHeight + dy))
            }

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove)
              document.removeEventListener("mouseup", handleMouseUp)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
          }}
        />
      )}
    </motion.div>
  )
}
