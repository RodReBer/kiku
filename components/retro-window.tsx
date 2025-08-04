"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface RetroWindowProps {
  id: string
  title: string
  children: React.ReactNode
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onMove: (position: { x: number; y: number }) => void
  onResize: (size: { width: number; height: number }) => void
  onFocus: () => void
}

export default function RetroWindow({
  id,
  title,
  children,
  isMinimized,
  isMaximized,
  position,
  size,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onFocus,
}: RetroWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("window-header")) {
      onFocus()
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFocus()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x))
        const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
        onMove({ x: newX, y: newY })
      }

      if (isResizing && !isMaximized) {
        const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x))
        const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y))
        onResize({ width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size, isMaximized, onMove, onResize])

  const windowStyle = isMaximized
    ? { x: 0, y: 32, width: "100vw", height: "calc(100vh - 32px)" }
    : { x: position.x, y: position.y, width: size.width, height: size.height }

  if (isMinimized) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        className="absolute bg-gray-200 border-2 border-gray-400 shadow-lg"
        style={{
          left: windowStyle.x,
          top: windowStyle.y,
          width: windowStyle.width,
          height: windowStyle.height,
          zIndex,
          borderStyle: "outset",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        onMouseDown={() => onFocus()}
      >
        {/* Barra de título */}
        <div
          className="window-header h-8 bg-gradient-to-r from-blue-600 to-blue-500 border-b-2 border-gray-400 flex items-center justify-between px-2 cursor-move"
          style={{ borderStyle: "inset" }}
          onMouseDown={handleMouseDown}
        >
          <span className="text-white font-bold text-sm truncate flex-1 ml-2">{title}</span>

          <div className="flex space-x-1">
            {/* Botón minimizar */}
            <button
              className="w-4 h-4 bg-yellow-400 border border-yellow-600 hover:bg-yellow-300 transition-colors"
              style={{ borderStyle: "outset" }}
              onClick={(e) => {
                e.stopPropagation()
                onMinimize()
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-0.5 bg-black"></div>
              </div>
            </button>

            {/* Botón maximizar */}
            <button
              className="w-4 h-4 bg-green-400 border border-green-600 hover:bg-green-300 transition-colors"
              style={{ borderStyle: "outset" }}
              onClick={(e) => {
                e.stopPropagation()
                onMaximize()
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 border border-black"></div>
              </div>
            </button>

            {/* Botón cerrar */}
            <button
              className="w-4 h-4 bg-red-400 border border-red-600 hover:bg-red-300 transition-colors"
              style={{ borderStyle: "outset" }}
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-black text-xs font-bold">×</div>
              </div>
            </button>
          </div>
        </div>

        {/* Contenido de la ventana */}
        <div className="flex-1 overflow-hidden" style={{ height: "calc(100% - 32px)" }}>
          {children}
        </div>

        {/* Handle de redimensionamiento */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 border-l border-t border-gray-400"
            style={{ borderStyle: "inset" }}
            onMouseDown={handleResizeMouseDown}
          >
            <div className="w-full h-full flex items-end justify-end p-0.5">
              <div className="w-2 h-2 bg-gray-500"></div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
