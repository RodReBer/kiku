"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function LoadingScreen() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Fondo KIKU rojo más visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image src="/kiku-loading-bg.png" alt="KIKU" fill className="object-contain opacity-60" priority />
      </div>

      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Contenido principal */}
      <div className="relative z-10 text-center">
        {/* Texto LOADING */}
        <h1
          className="text-4xl md:text-6xl text-white retro-font mb-8"
          style={{
            textShadow: `
              2px 2px 0px #333333,
              4px 4px 0px #666666
            `,
          }}
        >
          LOADING{dots}
        </h1>

        {/* Barra de progreso simple */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-800 border-2 border-gray-600 h-4 relative overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-600 to-gray-400 animate-pulse" />
          </div>
        </div>

        {/* Texto adicional sutil */}
        <div className="text-gray-400 text-sm retro-font mt-6 opacity-80">KIKU CREAM STUDIO</div>
      </div>

      {/* Efectos sutiles en las esquinas */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gray-600 opacity-50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gray-600 opacity-50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gray-600 opacity-50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gray-600 opacity-50" />
    </div>
  )
}
