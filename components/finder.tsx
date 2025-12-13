"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Search, Grid, List } from "lucide-react"

const FolderIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M2 20V4h8l2 2h10v14zm2-2h16V8h-8.825l-2-2H4zm0 0V6z" /></svg>
)

const PhotoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" className={className}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="m20 24l-8-8L2 26V2h28v22m-14-4l6-6l8 8v8H2v-6" /><circle cx="10" cy="9" r="3" /></g></svg>
)

const VideoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M15 8v8H5V8zm1-2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4V7a1 1 0 0 0-1-1" /></svg>
)

const PaintIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M7.061 22c1.523 0 2.84-.543 3.91-1.613c1.123-1.123 1.707-2.854 1.551-4.494l8.564-8.564a3.123 3.123 0 0 0-.002-4.414c-1.178-1.18-3.234-1.18-4.412 0l-8.884 8.884c-1.913.169-3.807 1.521-3.807 3.919c0 .303.021.588.042.86c.08 1.031.109 1.418-1.471 2.208a1 1 0 0 0-.122 1.717C2.52 20.563 4.623 22 7.061 22q-.002 0 0 0M18.086 4.328a1.144 1.144 0 0 1 1.586.002a1.12 1.12 0 0 1 0 1.584L12 13.586L10.414 12zM6.018 16.423c-.018-.224-.037-.458-.037-.706c0-1.545 1.445-1.953 2.21-1.953c.356 0 .699.073.964.206c.945.475 1.26 1.293 1.357 1.896c.177 1.09-.217 2.368-.956 3.107C8.865 19.664 8.049 20 7.061 20H7.06c-.75 0-1.479-.196-2.074-.427c1.082-.973 1.121-1.989 1.032-3.15" /></svg>
)

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
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
        coverImage: project.coverImageThumb || project.coverImage || project.photos?.[0]?.thumbUrl || project.photos?.[0]?.url,
      }
    })


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
      const project = projects.find(p => p.id === item.id)
      // Si tiene múltiples fotos, abrir como carpeta/carrusel
      if (project?.photos && project.photos.length > 1) {
        onFolderClick(item)
        return
      }
      // Si solo tiene una foto o coverImage, mostrar imagen expandida
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
    if (item.coverImage) {
      // Generate thumbnail URL from Firebase Storage (reduce memory on iOS)
      const getThumbnailUrl = (url: string, maxWidth = 200) => {
        // Use wsrv.nl for optimization
        // w=200: Small size for thumbnails
        // q=70: Quality 70% as requested
        // output=webp: Efficient format
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${maxWidth}&q=70&output=webp`
      }

      return (
        <div className="w-20 h-16 md:w-24 md:h-20 border-2 border-gray-400 flex items-center justify-center overflow-hidden bg-white" style={{ borderStyle: selectedId === item.id ? 'inset' : 'outset', outline: selectedId === item.id ? '2px dotted #000' : '' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getThumbnailUrl(item.coverImage)}
            alt={project?.name || item.name}
            className="object-cover w-full h-full"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>
      )
    }
    if (item.category === 'design') {
      return <PaintIcon className="text-[#99a1af]" size={26} />
    }

    if (item.category === 'photography') {
      return <PhotoIcon className="text-[#99a1af]" size={26} />
    }

    if (item.category === 'video') {
      return <VideoIcon className="text-[#99a1af]" size={26} />
    }

    switch (item.type) {
      case "folder":
        return <FolderIcon className="text-[#99a1af]" size={26} />
      case "file":
        return <FolderIcon className="text-[#99a1af]" size={26} /> // Fallback generic
      case "project":
        // Ya cubierto por las categorías arriba, pero por si acaso
        return <FolderIcon className="text-[#99a1af]" size={26} />
      default:
        return <FolderIcon className="text-[#99a1af]" size={26} />
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando archivos...</p>
          <input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-40"
          />
        </div>
        <div className="flex items-center gap-1">
          {['all', 'design', 'photography', 'video'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`text-xs px-3 py-1 border-2 border-gray-400 ${selectedCategory === cat ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'} `}
              style={{ borderStyle: selectedCategory === cat ? 'inset' : 'outset' }}
            >
              {cat === 'all' && 'Todos'}
              {cat === 'design' && 'Diseño'}
              {cat === 'photography' && 'Fotos'}
              {cat === 'video' && 'Y más'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 border-2 border-gray-400 ${viewMode === 'list' ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
            style={{ borderStyle: viewMode === 'list' ? 'inset' : 'outset' }}
            title="Lista"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 border-2 border-gray-400 ${viewMode === 'grid' ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
            style={{ borderStyle: viewMode === 'grid' ? 'inset' : 'outset' }}
            title="Iconos"
          >
            <Grid size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#d4d0c8] text-black font-sans">
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
            {['all', 'design', 'photography', 'video'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`text-xs px-3 py-1 border-2 border-gray-400 ${selectedCategory === cat ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'} `}
                style={{ borderStyle: selectedCategory === cat ? 'inset' : 'outset' }}
              >
                {cat === 'all' && 'Todos'}
                {cat === 'design' && 'Diseño'}
                {cat === 'photography' && 'Fotos'}
                {cat === 'video' && 'Y más'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 border-2 border-gray-400 ${viewMode === 'list' ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
              style={{ borderStyle: viewMode === 'list' ? 'inset' : 'outset' }}
              title="Lista"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 border-2 border-gray-400 ${viewMode === 'grid' ? 'bg-white' : 'bg-[#d4d0c8] hover:bg-[#c9c5bd]'}`}
              style={{ borderStyle: viewMode === 'grid' ? 'inset' : 'outset' }}
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
                      <FolderIcon size={16} className="text-[#99a1af]" />
                      <span>Todos los elementos</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("design")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "design" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`}
                      style={{ borderStyle: selectedCategory === "design" ? "inset" : "outset" }}
                    >
                      <PaintIcon size={16} className="text-[#99a1af]" />
                      <span>Diseño</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("photography")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "photography" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`}
                      style={{ borderStyle: selectedCategory === "photography" ? "inset" : "outset" }}
                    >
                      <PhotoIcon size={16} className="text-[#99a1af]" />
                      <span>Fotografía</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("video")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 ${selectedCategory === "video" ? "bg-white" : "bg-[#dcd8d0] hover:bg-[#d7d3cb]"} border-gray-400 text-left`}
                      style={{ borderStyle: selectedCategory === "video" ? "inset" : "outset" }}
                    >
                      <VideoIcon size={16} className="text-[#99a1af]" />
                      <span>Y más</span>
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
              <FolderIcon size={48} className="mx-auto mb-4 opacity-50 text-[#99a1af]" />
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
                  style={{ borderStyle: selectedId === item.id ? 'inset' : 'outset', outline: selectedId === item.id ? '2px dotted #000' : '' }}
                  onMouseDown={(e) => { if (item.category === 'photography' || item.category === 'video') e.stopPropagation(); }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mb-2">{getItemIcon(item)}</div>
                  <span className="text-[11px] md:text-xs text-center text-gray-800 font-medium truncate w-full" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {item.category === 'design' && <PaintIcon size={12} className="text-[#99a1af]" />}
                    {item.category === 'photography' && <PhotoIcon size={12} className="text-[#99a1af]" />}
                    {item.category === 'video' && <VideoIcon size={12} className="text-[#99a1af]" />}
                    <span className="text-[10px] text-gray-600 capitalize">
                      {item.category === 'photography' ? 'Fotos' : item.category === 'design' ? 'Diseño' : item.category === 'video' ? 'Y más' : item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 md:p-2 bg-[#d4d0c8] border-2 border-gray-400 cursor-pointer select-none"
                  style={{ borderStyle: selectedId === item.id ? 'inset' : 'outset', outline: selectedId === item.id ? '2px dotted #000' : '' }}
                  onMouseDown={(e) => { if (item.category === 'photography' || item.category === 'video') e.stopPropagation(); }}
                  onClick={() => handleItemClick(item)}
                >
                  {getItemIcon(item)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setExpandedImage(null)}>
          {/* Close button */}
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedImage}
              alt="Diseño"
              className="object-contain max-w-full max-h-full drop-shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
