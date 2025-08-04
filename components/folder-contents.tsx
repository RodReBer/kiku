"use client"

import { useState } from "react"
import Image from "next/image"
import { Grid, List, Folder } from "lucide-react"

interface AppItem {
  id: string
  name: string
  type: "folder" | "project" | "app" | "link" | "action"
  icon: string
  photos?: Array<{ id: string; name: string; url: string }>
  content?: string
}

interface FolderContentsProps {
  folderName: string
  items: AppItem[]
  onOpenItem: (item: AppItem) => void
}

export default function FolderContents({ folderName, items, onOpenItem }: FolderContentsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div
        className="bg-gray-200 p-3 border-b-2 border-gray-400 flex items-center justify-between"
        style={{ borderStyle: "inset" }}
      >
        <div className="flex items-center space-x-2">
          <Folder className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-black">{folderName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 border-2 rounded ${
              viewMode === "grid" ? "bg-blue-200 border-blue-400" : "bg-gray-100 border-gray-300"
            }`}
            style={{ borderStyle: viewMode === "grid" ? "inset" : "outset" }}
            title="Vista en cuadrícula"
          >
            <Grid className="h-3 w-3" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 border-2 rounded ${
              viewMode === "list" ? "bg-blue-200 border-blue-400" : "bg-gray-100 border-gray-300"
            }`}
            style={{ borderStyle: viewMode === "list" ? "inset" : "outset" }}
            title="Vista en lista"
          >
            <List className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto bg-white">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center p-3 rounded cursor-pointer hover:bg-blue-100 transition-colors duration-200 border-2 border-transparent hover:border-blue-300"
                style={{ borderStyle: "outset" }}
                onClick={() => onOpenItem(item)}
              >
                <div className="w-12 h-12 mb-2 flex items-center justify-center">
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="pixelated object-contain"
                  />
                </div>
                <span className="text-xs text-center text-gray-800 font-medium leading-tight">
                  {item.name}
                  {item.photos && <div className="text-xs text-gray-500">({item.photos.length} fotos)</div>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors duration-200 border border-transparent hover:border-blue-300"
                onClick={() => onOpenItem(item)}
              >
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="pixelated object-contain"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                  {item.photos && <span className="text-xs text-gray-500 ml-2">({item.photos.length} fotos)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {item.type === "project" ? "Proyecto" : item.type === "app" ? "Aplicación" : "Archivo"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-200 p-2 text-xs text-black border-t-2 border-gray-400" style={{ borderStyle: "inset" }}>
        {items.length} elemento{items.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
