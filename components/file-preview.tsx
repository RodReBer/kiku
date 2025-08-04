"use client"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilePreviewProps {
  isOpen: boolean
  onClose: () => void
  file: {
    name: string
    type: "image" | "text" | "unknown"
    content: string // For text, this is the text; for image, this is the URL
  }
}

export default function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] p-0 border-4 border-gray-400 bg-gray-200"
        style={{ borderStyle: "outset" }}
      >
        <DialogHeader
          className="flex flex-row items-center justify-between p-2 bg-gray-300 border-b-2 border-gray-400"
          style={{ borderStyle: "inset" }}
        >
          <DialogTitle className="text-sm font-bold text-black">{file.name}</DialogTitle>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1 h-auto w-auto text-black hover:bg-gray-400"
            style={{ borderStyle: "outset" }}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-4 bg-white overflow-auto max-h-[70vh]">
          {file.type === "image" && (
            <div className="flex justify-center items-center">
              <Image
                src={file.content || "/placeholder.svg"}
                alt={file.name}
                width={500}
                height={400}
                className="max-w-full h-auto pixelated"
              />
            </div>
          )}
          {file.type === "text" && (
            <pre
              className="whitespace-pre-wrap text-sm text-black font-mono bg-gray-100 p-3 border border-gray-300"
              style={{ borderStyle: "inset" }}
            >
              {file.content}
            </pre>
          )}
          {file.type === "unknown" && (
            <p className="text-sm text-gray-600 text-center">No se puede previsualizar este tipo de archivo.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
