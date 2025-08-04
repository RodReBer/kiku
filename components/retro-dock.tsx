"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

// Definimos una interfaz más explícita para los items del dock
interface DockAppItem {
  id: string // Para identificar la app/ventana
  icon: string
  label: string
  actionType: "openFinder" | "openDrawing" | "openMail" | "openInstagram" | "openShop" | "openAdmin" | "openTrash"
}

interface RetroDockProps {
  onAppClick: (actionType: DockAppItem["actionType"], id: string) => void // Modificado para pasar el tipo de acción y el id
  minimizedWindows?: Array<{ id: string; title: string; type: string }>
  onRestoreWindow: (id: string, type: string) => void
}

export default function RetroDock({ onAppClick, minimizedWindows = [], onRestoreWindow }: RetroDockProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Actualizamos dockItems para usar la nueva interfaz y actionType
  const dockItems: DockAppItem[] = [
    { id: "finder", icon: "/icons/archivo.png", label: "Proyectos", actionType: "openFinder" },
    { id: "drawing-app", icon: "/icons/diseno.png", label: "Diseño", actionType: "openDrawing" },
    { id: "mail", icon: "/icons/gmail.png", label: "Mail", actionType: "openMail" },
    { id: "instagram", icon: "/icons/safari.png", label: "Instagram", actionType: "openInstagram" },
    { id: "shop", icon: "/icons/compras.png", label: "Tienda", actionType: "openShop" },
    { id: "admin-panel", icon: "/icons/escritorio.png", label: "Admin", actionType: "openAdmin" },
    // { id: "contacto", icon: "/icons/contacto.png", label: "Contacto", actionType: "openMail" }, // Contacto ya abre Mail
    { id: "trash-bin", icon: "/icons/papelera.png", label: "Papelera", actionType: "openTrash" },
  ]

  return (
    <div className="flex justify-center p-2 sm:p-4 relative">
      {hoveredItem && (
        <div className="absolute bottom-16 sm:bottom-20 bg-gray-800 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold border border-gray-600 shadow-lg whitespace-nowrap z-50">
          {hoveredItem}
        </div>
      )}

      <div
        className="bg-gray-300 border-2 border-gray-400 p-2 sm:p-3 flex items-center space-x-1 sm:space-x-2 shadow-lg overflow-x-auto"
        style={{ borderStyle: "outset" }}
      >
        {dockItems.map((item) => (
          <motion.button
            key={item.id}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-gray-400 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all duration-200 p-1 relative flex-shrink-0"
            style={{ borderStyle: "inset" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAppClick(item.actionType, item.id)} // Llamar a onAppClick con actionType e id
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
            aria-label={item.label}
          >
            <Image
              src={item.icon || "/placeholder.svg?width=32&height=32"}
              alt={item.label}
              width={24} // Ajustado para mejor visualización en botones pequeños
              height={24}
              className="pixelated sm:w-7 sm:h-7" // Ajustado
            />
          </motion.button>
        ))}

        {minimizedWindows && minimizedWindows.length > 0 && (
          <div className="w-px h-6 sm:h-8 bg-gray-500 mx-1 sm:mx-2 flex-shrink-0 border-l border-gray-600 border-r border-gray-200" />
        )}

        {minimizedWindows &&
          minimizedWindows.map((window) => (
            <motion.button
              key={window.id} // Usar el id único de la ventana minimizada
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-all duration-200 text-black text-xs font-bold flex-shrink-0 p-1"
              style={{ borderStyle: "outset" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, borderStyle: "inset" }}
              onClick={() => onRestoreWindow(window.id, window.type)}
              onMouseEnter={() => setHoveredItem(window.title)}
              onMouseLeave={() => setHoveredItem(null)}
              aria-label={`Restaurar ${window.title}`}
            >
              {/* Intenta mostrar un icono si está disponible o las iniciales */}
              {dockItems.find((item) => item.id === window.id)?.icon ? (
                <Image
                  src={dockItems.find((item) => item.id === window.id)?.icon || "/placeholder.svg?width=32&height=32"}
                  alt={window.title.slice(0, 2)}
                  width={20}
                  height={20}
                  className="pixelated sm:w-5 sm:h-5"
                />
              ) : (
                window.title.slice(0, 2).toUpperCase()
              )}
            </motion.button>
          ))}
      </div>
    </div>
  )
}
