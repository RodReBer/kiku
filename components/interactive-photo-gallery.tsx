"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Photo } from "@/lib/data" // Importar Photo

interface InteractivePhotoGalleryProps {
  photos: Photo[]
  projectName: string
}

export default function InteractivePhotoGallery({ photos, projectName }: InteractivePhotoGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const showNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length)
  }

  const showPrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length)
  }

  const currentPhoto = photos[currentPhotoIndex]

  return (
    <div className="h-full flex flex-col bg-gray-200 font-sans">
      {/* Gallery Header */}
      <div
        className="bg-gray-300 p-2 border-b-2 border-gray-400 text-black font-bold"
        style={{ borderStyle: "outset" }}
      >
        Galería: {projectName}
      </div>

      {/* Photo Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer border-2 border-gray-400 bg-white p-1"
              style={{ borderStyle: "inset" }}
              onClick={() => openModal(index)}
            >
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.name}
                width={200}
                height={150}
                className="w-full h-32 object-cover pixelated transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-bold text-center p-2">{photo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full-size photo */}
      {isModalOpen && currentPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]" style={{ height: '100vh', minHeight: '100vh' }}>
          <div
            className="relative bg-gray-200 border-4 border-gray-400 shadow-lg p-2"
            style={{ borderStyle: "outset" }}
          >
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-red-700 z-10"
              style={{ borderStyle: "outset" }}
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center p-4">
              <button
                onClick={showPrevPhoto}
                className="p-2 bg-gray-300 border-2 border-gray-400 hover:bg-gray-100 text-black mr-2"
                style={{ borderStyle: "outset" }}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="relative" style={{ width: "auto", height: "auto", maxWidth: "80vw", maxHeight: "80vh" }}>
                <Image
                  src={currentPhoto.url || "/placeholder.svg"}
                  alt={currentPhoto.name}
                  layout="intrinsic" // Use intrinsic for adapting to image size
                  width={800} // Max width for intrinsic
                  height={600} // Max height for intrinsic
                  className="max-w-full max-h-full object-contain pixelated"
                />
              </div>
              <button
                onClick={showNextPhoto}
                className="p-2 bg-gray-300 border-2 border-gray-400 hover:bg-gray-100 text-black ml-2"
                style={{ borderStyle: "outset" }}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="text-center mt-2 text-black font-bold">
              {currentPhoto.name} ({currentPhotoIndex + 1} de {photos.length})
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
