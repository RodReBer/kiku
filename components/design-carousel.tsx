"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface DesignCarouselProps {
  images: string[]
  projectName: string
  onClose: () => void
}

export default function DesignCarousel({ images, projectName, onClose }: DesignCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Focus automático para permitir navegación con teclado
    containerRef.current?.focus()
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") onClose()
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={`${projectName} - ${currentIndex + 1}`}
          className="object-contain max-w-full max-h-full drop-shadow-2xl"
        />

        {/* Navigation arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors z-[10000]"
              aria-label="Anterior"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors z-[10000]"
              aria-label="Siguiente"
            >
              <ChevronRight size={32} />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
