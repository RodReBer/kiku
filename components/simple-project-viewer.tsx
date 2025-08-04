"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface SimpleProjectViewerProps {
  projectName: string
  images: string[]
  description?: string
}

export default function SimpleProjectViewer({ projectName, images, description }: SimpleProjectViewerProps) {
  return (
    <Card className="w-full h-full flex flex-col bg-gray-100 border-2 border-gray-400" style={{ borderStyle: "inset" }}>
      <CardHeader className="border-b-2 border-gray-400" style={{ borderStyle: "outset" }}>
        <CardTitle className="text-black text-lg font-bold">{projectName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-auto">
        {description && (
          <p
            className="text-sm text-gray-700 mb-4 bg-white p-2 border border-gray-300"
            style={{ borderStyle: "inset" }}
          >
            {description}
          </p>
        )}
        <Carousel className="w-full max-w-full mx-auto">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="bg-white border-2 border-gray-400" style={{ borderStyle: "outset" }}>
                    <CardContent className="flex aspect-video items-center justify-center p-6">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${projectName} image ${index + 1}`}
                        width={800}
                        height={450}
                        className="max-w-full max-h-full object-contain pixelated"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className="bg-gray-300 border-2 border-gray-400 text-black hover:bg-gray-400"
            style={{ borderStyle: "outset" }}
          />
          <CarouselNext
            className="bg-gray-300 border-2 border-gray-400 text-black hover:bg-gray-400"
            style={{ borderStyle: "outset" }}
          />
        </Carousel>
      </CardContent>
    </Card>
  )
}
