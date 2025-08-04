"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface TopMenuBarProps {
  onOpenDrawingApp?: () => void
}

export default function TopMenuBar({ onOpenDrawingApp }: TopMenuBarProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-8 w-full flex items-center justify-between px-4 border-b-2 border-black relative z-50"
      style={{ backgroundColor: "#ff4a5c" }}
    >
      {/* Nube pequeña más grande y más abajo - ahora es KIKU Paint */}
      <div className="absolute left-4 top-1.5">
        <button
          onClick={onOpenDrawingApp}
          className="hover:scale-110 transition-transform duration-200 focus:outline-none group"
          title="Abrir KIKU Paint"
        >
          <Image
            src="/nube-chica.png"
            alt="KIKU Paint"
            width={100}
            height={100}
            className="object-contain drop-shadow-md group-hover:drop-shadow-lg"
            draggable={false}
          />
        </button>
      </div>

      {/* Hora centrada */}
      <div className="flex-1 flex justify-center">
        <span className="text-white font-bold text-sm font-mono">{currentTime}</span>
      </div>

      {/* Espacio para balance */}
      <div className="w-16"></div>
    </div>
  )
}
