"use client"

import Image from "next/image"
import { ZoomIn } from "lucide-react"

interface Photo {
  id: string
  name: string
  url: string
}

interface ProjectMasonryGalleryProps {
  photos: Photo[]
  projectName: string
  onOpenPhoto: (photo: Photo) => void
}

export default function ProjectMasonryGallery({ photos, projectName, onOpenPhoto }: ProjectMasonryGalleryProps) {
  const handlePhotoClick = (photo: Photo) => {
    console.log("Clicking photo:", photo.name)
    onOpenPhoto(photo)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="bg-gray-200 p-3 border-b-2 border-gray-400 flex items-center justify-between flex-shrink-0"
        style={{ borderStyle: "inset" }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
          <span className="text-sm font-bold text-black">{projectName}</span>
        </div>
        <div className="text-xs text-gray-600">{photos.length} fotos</div>
      </div>

      {/* Gallery */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-8"
          style={{ columnFill: "balance" }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-8 group cursor-pointer"
              onClick={() => handlePhotoClick(photo)}
            >
              <div
                className="relative overflow-hidden rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors duration-200 hover:shadow-lg"
                style={{ borderStyle: "outset" }}
              >
                <Image
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.name}
                  width={500}
                  height={600}
                  className="w-full h-auto object-cover pixelated transition-opacity duration-200 group-hover:opacity-90"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                </div>
              </div>
              <div className="mt-3 px-1">
                <p className="text-sm font-medium text-gray-800 text-center" title={photo.name}>
                  {photo.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
