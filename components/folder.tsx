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
  const folderRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const draftPosRef = useRef({ x: initialPosition.x, y: initialPosition.y })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    draftPosRef.current = { x: position.x, y: position.y }

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
      onDoubleClick(id)
      setIsClicked(false)
    } else {
      setIsClicked(true)
      clickTimeout.current = setTimeout(() => {
        setIsClicked(false)
        clickTimeout.current = null
      }, 300)
    }
  }

  const commitPosition = () => {
    setPosition({ x: draftPosRef.current.x, y: draftPosRef.current.y })
    if (folderRef.current) folderRef.current.style.transform = ""
  }

  const applyTransform = () => {
    if (folderRef.current) {
      const dx = draftPosRef.current.x - position.x
      const dy = draftPosRef.current.y - position.y
      folderRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }
    rafRef.current = null
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    draftPosRef.current.x = e.clientX - dragOffset.current.x
    draftPosRef.current.y = e.clientY - dragOffset.current.y
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(applyTransform)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      commitPosition()
    }
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true })
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
      ref={folderRef}
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
