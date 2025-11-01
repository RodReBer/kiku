"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, FileText, ImageIcon, Search, Grid, List } from "lucide-react"
import Image from "next/image"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder" | "project"
  category: "design" | "photography" | "video" | "general"
  coverImage?: string
}

interface FinderProps {
  onFileClick: (file: FileItem) => void
  onFolderClick: (folder: FileItem) => void
  initialCategory?: "all" | "design" | "photography" | "video" | "general"
}

export default function Finder({ onFileClick, onFolderClick, initialCategory = "all" }: FinderProps) {
  const { projects, loading } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "design" | "photography" | "video" | "general">(initialCategory)

  // Convertir proyectos a FileItems (solo los activos)
  const fileItems: FileItem[] = projects
    .filter(project => project.status === "active")
    .map((project) => {
      // Fotografía y Video: mostrarse como carpeta (abre todas sus fotos/videos)
      const isPhotography = project.category === 'photography'
      const isVideo = project.category === 'video'
      return {
        id: project.id,
        name: project.name,
        type: (isPhotography || isVideo) ? 'folder' : (project.type === 'file' || project.type === 'folder' ? project.type : 'project'),
        category: project.category || 'general',
        coverImage: project.coverImage || project.photos?.[0]?.url,
      }
    })
  
  console.log("Projects from Firebase:", projects);
  console.log("Active projects shown:", fileItems.length);

  // Filtrar items
  const filteredItems = fileItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleItemClick = (item: FileItem) => {
    setSelectedId(item.id)
    if (item.category === 'photography' || item.category === 'video') {
      // Tratar como carpeta: delegar a onFolderClick
      onFolderClick(item)
      return
    }
    if (item.category === 'design') {
      // Abrir imagen individual (si tiene coverImage)
      const project = projects.find(p => p.id === item.id)
      const image = project?.coverImage || project?.photos?.[0]?.url
      if (image) setExpandedImage(image)
      return
    }
    // Otros tipos
    if (item.type === 'file') onFileClick(item)
    else onFolderClick(item)
  }

  const getItemIcon = (item: FileItem) => {
    // We'll attempt to find the project to get coverImage
    const project = projects.find(p => p.id === item.id)
    if (project?.coverImage) {
      return (
        <div className="w-20 h-16 md:w-24 md:h-20 border-2 border-gray-400 flex items-center justify-center overflow-hidden bg-white" style={{ borderStyle: selectedId===item.id? 'inset':'outset', outline: selectedId===item.id? '2px dotted #000':'' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.coverImage} alt={project.name} className="object-cover w-full h-full" draggable={false} />
        </div>
      )
    }
    switch (item.type) {
      case "folder":
        return <Folder className="text-yellow-700" size={26} />
      case "file":
        return <FileText className="text-blue-700" size={26} />
      case "project":
        return item.category === "photography" ? (
          <ImageIcon className="text-green-700" size={26} />
        ) : (
          <Folder className="text-purple-700" size={26} />
        )
      default:
        return <FileText className="text-gray-700" size={26} />
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
    <div className="h-full flex flex-col bg-[#d4d0c8] text-black font-sans" style={{ fontFamily: 'Tahoma, Verdana, sans-serif' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-400 bg-[#e4e0d8] p-2" style={{ borderBottomStyle: 'outset' }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border-2 border-gray-400 px-2 py-1" style={{ borderStyle: 'inset' }}>
            <Search size={14} className="text-gray-600 mr-1" />
            <input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-40"
            />
          </div>
          <div className="flex items-center gap-1">
            {['all','design','photography','video'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`text-xs px-3 py-1 border-2 border-gray-400 ${selectedCategory===cat? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'} `}
                style={{ borderStyle: selectedCategory===cat? 'inset':'outset' }}
              >
                {cat==='all' && 'Todos'}
                {cat==='design' && 'Diseño'}
                {cat==='photography' && 'Fotos'}
                {cat==='video' && 'Y más'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 border-2 border-gray-400 ${viewMode==='list'? 'bg-white':'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
              style={{ borderStyle: viewMode==='list'? 'inset':'outset' }}
              title="Lista"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 border-2 border-gray-400 ${viewMode==='grid'? 'bg-white':'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
              style={{ borderStyle: viewMode==='grid'? 'inset':'outset' }}
              title="Iconos"
            >
              <Grid size={14} />
            </button>
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
  <div className="flex-1 overflow-auto p-3 md:p-4 bg-[#e4e0d8]" style={{ boxShadow: 'inset 0 0 0 1px #fff' }}>
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
                  className="flex flex-col items-center p-2 md:p-3 bg-[#d4d0c8] border-2 border-gray-400 cursor-pointer select-none"
                  style={{ borderStyle: selectedId===item.id? 'inset':'outset', outline: selectedId===item.id? '2px dotted #000':'' }}
                  onMouseDown={(e) => { if(item.category==='photography') e.stopPropagation(); }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mb-2">{getItemIcon(item)}</div>
                  <span className="text-[11px] md:text-xs text-center text-gray-800 font-medium truncate w-full" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-gray-600 mt-1 capitalize">{item.category === 'photography' ? '📁 Fotos' : item.category === 'design' ? '🎨 Diseño' : item.category === 'video' ? '✨ Y más' : item.category}</span>
                </div>
              ))}
            </div>
          ) : (
    <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 md:p-2 bg-[#d4d0c8] border-2 border-gray-400 cursor-pointer select-none"
                  style={{ borderStyle: selectedId===item.id? 'inset':'outset', outline: selectedId===item.id? '2px dotted #000':'' }}
                  onMouseDown={(e) => { if(item.category==='photography') e.stopPropagation(); }}
                  onClick={() => handleItemClick(item)}
                >
                  {getItemIcon(item)}
                  <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-gray-600 capitalize">
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
  <div className="px-3 md:px-4 py-1 border-t-2 border-gray-400 bg-[#d4d0c8] text-[11px]" style={{ borderTopStyle: 'outset' }}>
    <p className="text-gray-700">
          {filteredItems.length} elemento{filteredItems.length !== 1 ? "s" : ""}
          {searchTerm && ` encontrado${filteredItems.length !== 1 ? "s" : ""} para "${searchTerm}"`}
        </p>
      </div>

      {expandedImage && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <div className="bg-[#d4d0c8] p-2 border-2 border-gray-400 max-w-[90vw] max-h-[90vh]" style={{ borderStyle: 'outset' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold">Vista ampliada</span>
              <button onClick={() => setExpandedImage(null)} className="text-xs px-2 py-0.5 border-2 border-gray-400 bg-[#d4d0c8] hover:bg-[#c9c5bd]" style={{ borderStyle: 'outset' }}>Cerrar</button>
            </div>
            <div className="overflow-auto" style={{ maxWidth: '80vw', maxHeight: '75vh' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={expandedImage} alt="Diseño" className="object-contain max-w-full max-h-[70vh] mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
