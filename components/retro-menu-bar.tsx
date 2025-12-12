"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface RetroMenuBarProps {
  onWallpaperChange: () => void
  onOpenAbout: () => void
  onJoinClick?: () => void
}

export default function RetroMenuBar({ onWallpaperChange, onOpenAbout, onJoinClick }: RetroMenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu)
  }

  const handleAboutClick = () => {
    onOpenAbout()
    setActiveMenu(null)
  }

  const handleJoinClick = () => {
    onJoinClick?.()
    setActiveMenu(null)
  }

  return (
    <div className="bg-gray-200 border-b-2 border-gray-400 px-2 py-1 flex items-center text-sm font-bold relative z-50 ">
      {/* KIKU CREAM Menu */}
      <div className="relative">
        <button
          className="px-3 py-1 hover:bg-blue-500 hover:text-white rounded transition-colors duration-150"
          onClick={() => handleMenuClick("kiku")}
        >
          KIKU CREAM
          <ChevronDown className="inline ml-1 h-3 w-3" />
        </button>
        {activeMenu === "kiku" && (
          <div className="absolute top-full left-0 bg-white border-2 border-gray-400 shadow-lg min-w-48 z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm"
              onClick={handleAboutClick}
            >
              Acerca de KIKU CREAM
            </button>
            <hr className="border-gray-300" />
            <button
              className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm"
              onClick={() => setActiveMenu(null)}
            >
              Preferencias...
            </button>
            <hr className="border-gray-300" />
            <button
              className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm"
              onClick={handleJoinClick}
            >
              ✨ Únete a nosotros
            </button>
          </div>
        )}
      </div>

      {/* File Menu */}
      <div className="relative">
        <button
          className="px-3 py-1 hover:bg-blue-500 hover:text-white rounded transition-colors duration-150"
          onClick={() => handleMenuClick("file")}
        >
          Archivo
        </button>
        {activeMenu === "file" && (
          <div className="absolute top-full left-0 bg-white border-2 border-gray-400 shadow-lg min-w-32 z-50">
            <button className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm">
              Nuevo
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm">
              Abrir
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          className="px-3 py-1 hover:bg-blue-500 hover:text-white rounded transition-colors duration-150"
          onClick={() => handleMenuClick("view")}
        >
          Ver
        </button>
        {activeMenu === "view" && (
          <div className="absolute top-full left-0 bg-white border-2 border-gray-400 shadow-lg min-w-32 z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm"
              onClick={onWallpaperChange}
            >
              Cambiar Fondo
            </button>
          </div>
        )}
      </div>

      {/* Clock */}
      <div className="ml-auto text-xs">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
    </div>
  )
}
