"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, FileText, ImageIcon, Search, Grid, List } from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder" | "project"
  category: "design" | "photography" | "general"
}

interface FinderProps {
  onFileClick: (file: FileItem) => void
  onFolderClick: (folder: FileItem) => void
  initialCategory?: "all" | "design" | "photography" | "general"
}

export default function Finder({ onFileClick, onFolderClick, initialCategory = "all" }: FinderProps) {
  const { projects, loading } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "design" | "photography" | "general">(initialCategory)

  // Convertir proyectos a FileItems (solo los activos)
  const fileItems: FileItem[] = projects
    .filter(project => project.status === "active") // Solo mostrar proyectos activos
    .map((project) => ({
      id: project.id,
      name: project.name,
      type: project.type === "file" || project.type === "folder" ? project.type : "project",
      category: project.category || "general",
    }))
  
  console.log("Projects from Firebase:", projects);
  console.log("Active projects shown:", fileItems.length);

  // Filtrar items
  const filteredItems = fileItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleItemClick = (item: FileItem) => {
    if (item.type === "file") {
      onFileClick(item)
    } else {
      onFolderClick(item)
    }
  }

  const getItemIcon = (item: FileItem) => {
    switch (item.type) {
      case "folder":
        return <Folder className="text-yellow-600" size={24} />
      case "file":
        return <FileText className="text-blue-600" size={24} />
      case "project":
        return item.category === "photography" ? (
          <ImageIcon className="text-green-600" size={24} />
        ) : (
          <Folder className="text-purple-600" size={24} />
        )
      default:
        return <FileText className="text-gray-600" size={24} />
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando archivos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search size={16} className="text-gray-500" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="text-xs px-2 py-1"
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "design" ? "default" : "outline"}
                onClick={() => setSelectedCategory("design")}
                className="text-xs px-2 py-1"
              >
                Diseño
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "photography" ? "default" : "outline"}
                onClick={() => setSelectedCategory("photography")}
                className="text-xs px-2 py-1"
              >
                Fotos
              </Button>
            </div>

            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                className="p-1"
              >
                <Grid size={14} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="p-1"
              >
                <List size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Windows 2000-style sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (hidden on small screens to avoid clutter) */}
        <aside className="hidden md:block w-60 shrink-0 bg-[#d4d0c8] border-r-2 border-gray-400" style={{ borderRightStyle: "outset" }}>
          <div className="h-full p-2">
            {/* Inner panel with inset look */}
            <div className="h-full bg-[#e4e0d8] border-2 border-gray-400" style={{ borderStyle: "inset" }}>
              <div className="px-3 py-2 bg-gradient-to-b from-[#3a6ea5] to-[#2f5d8c] text-white text-sm font-semibold">
                Tareas de archivo
              </div>
              <div className="p-2 space-y-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-700 mb-2">Explorar</p>
                  <nav className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "all" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`} 
                      style={{ borderStyle: selectedCategory === "all" ? "inset" : "outset" }}
                    >
                      <Folder size={16} className="text-yellow-700" />
                      <span>Todos los elementos</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("design")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "design" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`} 
                      style={{ borderStyle: selectedCategory === "design" ? "inset" : "outset" }}
                    >
                      <Folder size={16} className="text-purple-700" />
                      <span>Diseño</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("photography")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "photography" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`} 
                      style={{ borderStyle: selectedCategory === "photography" ? "inset" : "outset" }}
                    >
                      <ImageIcon size={16} className="text-green-700" />
                      <span>Fotografía</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("general")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "general" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`} 
                      style={{ borderStyle: selectedCategory === "general" ? "inset" : "outset" }}
                    >
                      <FileText size={16} className="text-blue-700" />
                      <span>General</span>
                    </button>
                  </nav>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-700 mb-2">Vista</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 border-2 ${viewMode === "list" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400`} 
                      style={{ borderStyle: viewMode === "list" ? "inset" : "outset" }}
                      title="Lista"
                    >
                      <List size={14} />
                      <span className="text-xs">Lista</span>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 border-2 ${viewMode === "grid" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400`} 
                      style={{ borderStyle: viewMode === "grid" ? "inset" : "outset" }}
                      title="Iconos"
                    >
                      <Grid size={14} />
                      <span className="text-xs">Iconos</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-gray-600 leading-4 px-1">
                  Consejo: usa la barra de búsqueda para filtrar rápidamente por nombre.
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-3 md:p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron archivos</p>
              {searchTerm && <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>}
              {!searchTerm && selectedCategory !== "all" && (
                <p className="text-sm mt-2">No hay proyectos activos en esta categoría</p>
              )}
              {!searchTerm && selectedCategory === "all" && fileItems.length === 0 && (
                <p className="text-sm mt-2">No hay proyectos activos disponibles</p>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mb-2">{getItemIcon(item)}</div>
                  <span className="text-xs md:text-sm text-center text-gray-700 font-medium truncate w-full">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 capitalize">{item.category}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 md:p-3 bg-white rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => handleItemClick(item)}
                >
                  {getItemIcon(item)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.category} • {item.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-300 px-3 md:px-4 py-2">
        <p className="text-xs text-gray-500">
          {filteredItems.length} elemento{filteredItems.length !== 1 ? "s" : ""}
          {searchTerm && ` encontrado${filteredItems.length !== 1 ? "s" : ""} para "${searchTerm}"`}
        </p>
      </div>
    </div>
  )
}
