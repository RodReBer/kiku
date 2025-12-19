"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Save, X, RefreshCw, ImageIcon, Folder, Check, Archive, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Project, Product, Photo } from "@/context/data-context"
import { uploadImage, uploadMultipleImages, generateProjectPath } from "@/lib/storage-utils"
import { generateThumbnails } from "@/lib/thumbnail-utils"

// Helper para obtener dimensiones de una imagen
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = (err) => {
      console.error("Error getting image dimensions:", err)
      resolve({ width: 800, height: 600 }) // Fallback seguro
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function AdminPanel() {
  const { toast } = useToast()
  const {
    projects,
    products,
    loading,
    error,
    updateProject,
    addProject,
    deleteProject,
    updateProduct,
    addProduct,
    deleteProduct,
    refreshData,
  } = useData()

  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    category: "photography",
    photos: [],
    coverImage: "",
    order: 0,
  })

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    image: "",
    description: "",
    category: "prints",
    status: "available",
    stock: 0,
  })

  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const handleCoverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
    }
  }

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setUploadingFiles(true)
    try {
      let coverImageUrl = newProject.coverImage || ""
      let uploadedPhotoUrls: string[] = []

      // Subir cover image si se seleccionó un archivo
      let coverImageThumbUrl = ""
      if (coverImageFile) {
        const basePath = generateProjectPath(
          newProject.category as "design" | "photography" | "video" | "general",
          newProject.name
        )

        // Subir imagen original
        coverImageUrl = await uploadImage(coverImageFile, `${basePath}/cover-${coverImageFile.name}`)

        // Generar y subir thumbnail para el cover
        try {
          const coverThumb = await generateThumbnails([coverImageFile], 400)
          if (coverThumb.length > 0) {
            coverImageThumbUrl = await uploadImage(coverThumb[0], `${basePath}/thumbs/cover-${coverImageFile.name}`)
          }
        } catch (e) {
          console.error("Error generating cover thumbnail:", e)
        }

        toast({
          title: "✓ Cover image subida",
          description: "Imagen de portada y miniatura subidas correctamente",
        })
      }

      // Subir archivos seleccionados si los hay
      let photos: Photo[] = []
      if (selectedFiles.length > 0) {
        const basePath = generateProjectPath(
          newProject.category as "design" | "photography" | "video" | "general",
          newProject.name
        )

        // Generar thumbnails (400px, calidad 95%) para carga rápida en cascadas
        toast({
          title: "Generando miniaturas...",
          description: "Creando versiones optimizadas de las imágenes",
        })

        const thumbnails = await generateThumbnails(selectedFiles, 400)

        // Subir imágenes originales SIN COMPRIMIR (calidad 100%)
        // Firebase Storage las guarda exactamente como están
        uploadedPhotoUrls = await uploadMultipleImages(selectedFiles, basePath)

        // Subir thumbnails en paralelo (estos sí están optimizados)
        const thumbUrls = await uploadMultipleImages(thumbnails, `${basePath}/thumbs`)

        // Obtener dimensiones de las imágenes originales
        const dimensionsPromises = selectedFiles.map(file => getImageDimensions(file))
        const dimensions = await Promise.all(dimensionsPromises)

        toast({
          title: `✓ ${uploadedPhotoUrls.length} archivos subidos`,
          description: "Imágenes originales (calidad 100%) y miniaturas guardadas",
        })

        // Crear objetos Photo con ambas URLs y dimensiones
        photos = uploadedPhotoUrls.map((url, index) => ({
          id: `photo-${Date.now()}-${index}`,
          url: url,
          thumbUrl: thumbUrls[index], // URL del thumbnail
          width: dimensions[index].width,
          height: dimensions[index].height,
          title: `Foto ${index + 1}`,
          description: "",
        }))
      }

      await addProject({
        name: newProject.name!,
        category: newProject.category!,
        type: newProject.category === "photography" ? "photography" : newProject.category === "design" ? "design" : "video",
        status: "active",
        description: "",
        coverImage: coverImageUrl,
        coverImageThumb: coverImageThumbUrl,
        photos,
        order: newProject.order || 0,
      } as Omit<Project, "id">)

      toast({
        title: "✓ Proyecto creado",
        description: `${newProject.name} se agregó correctamente`,
      })

      // Reset form
      setNewProject({
        name: "",
        category: "photography",
        photos: [],
        coverImage: "",
        order: 0,
      })
      setSelectedFiles([])
      setCoverImageFile(null)
      setShowNewProject(false)
    } catch (err) {
      console.error("Error adding project:", err)
      toast({
        title: "Error",
        description: "Error al crear el proyecto. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try {
      await addProduct(newProduct as Omit<Product, "id">)

      setNewProduct({
        name: "",
        price: 0,
        image: "",
        description: "",
        category: "prints",
        status: "available",
        stock: 0,
      })
      setShowNewProduct(false)
    } catch (err) {
      console.error("Error adding product:", err)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      await deleteProject(id)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      await deleteProduct(id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl">Cargando datos de KIKU...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎨 KIKU Admin Zone</h1>
              <p className="text-purple-200">Panel de control estético para tu portfolio retro</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button
                onClick={refreshData}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw size={16} className="mr-2" />
                Refrescar
              </Button>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              <Folder size={16} className="mr-2" />
              Proyectos ({projects.length})
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              <ImageIcon size={16} className="mr-2" />
              Productos ({products.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Gestión de Proyectos</h2>
              <Button
                onClick={() => setShowNewProject(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Plus size={16} className="mr-2" />
                Nuevo Proyecto
              </Button>
            </div>

            {showNewProject && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus size={20} className="mr-2" />
                    Crear Nuevo Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Nombre del Proyecto</label>
                      <Input
                        placeholder="Ej: El Cuartito Retro"
                        value={newProject.name || ""}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Categoría</label>
                      <Select
                        value={newProject.category || ""}
                        onValueChange={(value) =>
                          setNewProject({ ...newProject, category: value as Project["category"] })
                        }
                      >
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700">
                          <SelectItem value="photography">📸 Fotografía</SelectItem>
                          <SelectItem value="design">� Diseño</SelectItem>
                          <SelectItem value="video">🎬 Y más</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Orden (Menor número = Primero)</label>
                      <Input
                        type="number"
                        placeholder="Ej: 1"
                        value={newProject.order || ""}
                        onChange={(e) => setNewProject({ ...newProject, order: Number(e.target.value) })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      📸 Imagen Principal (Cover)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer transition-colors">
                        <Upload size={16} />
                        <span className="text-sm">
                          {coverImageFile ? `✓ ${coverImageFile.name}` : "Seleccionar imagen de portada"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageSelect}
                          className="hidden"
                        />
                      </label>
                      {coverImageFile && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCoverImageFile(null)}
                          className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                    <p className="text-purple-300 text-xs mt-1">
                      🔥 Se subirá a Firebase Storage automáticamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Subir Archivos (Fotos/Videos)
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer transition-colors mb-2">
                      <Upload size={18} />
                      <span>Seleccionar archivos desde tu computadora</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    {selectedFiles.length > 0 && (
                      <div className="bg-white/10 rounded p-2 mb-2">
                        <p className="text-purple-200 text-sm font-medium mb-1">
                          {selectedFiles.length} archivo(s) seleccionado(s):
                        </p>
                        <ul className="text-xs text-purple-300 space-y-1">
                          {selectedFiles.map((file, idx) => (
                            <li key={idx}>✓ {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-purple-300 text-xs">
                      🔥 Los archivos se subirán automáticamente a Firebase Storage
                    </p>
                    {newProject.category === 'design' && (
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded p-3 mt-2">
                        <p className="text-blue-200 text-sm">
                          💡 <strong>Diseños:</strong> Puedes subir múltiples imágenes (ej: diseños en diferentes colores). Se mostrarán en un carrusel con flechas para navegar.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddProject}
                      disabled={uploadingFiles}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {uploadingFiles ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Subiendo archivos...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Crear Proyecto
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewProject(false)}
                      disabled={uploadingFiles}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-50"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {projects.map((project: Project) => (
                <Card
                  key={project.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          {project.type === "photography" && "📸"}
                          {project.type === "design" && "🎨"}
                          {project.type === "illustration" && "✏️"}
                          {project.type === "file" && "📄"}
                          {project.type === "folder" && "📁"}
                          <span className="ml-2">{project.name}</span>
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-purple-500/30 text-purple-200">
                            {project.type}
                          </Badge>
                          <Badge variant="outline" className="border-purple-400 text-purple-200">
                            {project.category}
                          </Badge>
                          <Badge variant="outline" className="border-blue-400 text-blue-200">
                            Orden: {project.order || 0}
                          </Badge>
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className={
                              project.status === "active"
                                ? "bg-green-500/30 text-green-200"
                                : "bg-gray-500/30 text-gray-200"
                            }
                          >
                            {project.status === "active" ? "✅ Activo" : "📦 Archivado"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={project.status === "active" ? "default" : "secondary"}
                          onClick={async () => {
                            const newStatus = project.status === "active" ? "archived" : "active"
                            try {
                              await updateProject(project.id, { status: newStatus })
                              toast({
                                title: "Estado actualizado",
                                description: `El proyecto "${project.name}" ha sido ${newStatus === "active" ? "activado" : "archivado"}.`,
                                variant: "default",
                              })
                            } catch {
                              toast({
                                title: "Error al actualizar",
                                description: "No se pudo cambiar el estado del proyecto. Intente nuevamente.",
                                variant: "destructive",
                              })
                            }
                          }}
                          className={
                            project.status === "active"
                              ? "bg-amber-500/30 text-amber-100 hover:bg-amber-500/50"
                              : "bg-green-500/30 text-green-100 hover:bg-green-500/50"
                          }
                        >
                          {project.status === "active" ? (
                            <>
                              <Archive className="h-4 w-4 mr-1" /> Archivar
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Activar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(project.id)}
                          disabled={editingProject === project.id}
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-red-500/30 border-red-500/50 text-red-200 hover:bg-red-500/50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingProject === project.id ? (
                      <ProjectEditForm
                        project={project}
                        onSave={async (updates) => {
                          await updateProject(project.id, updates)
                          setEditingProject(null)
                        }}
                        onCancel={() => setEditingProject(null)}
                      />
                    ) : (
                      <div>
                        {project.coverImage && (
                          <div className="mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={project.coverImage} alt={project.name} className="w-full max-w-sm rounded-md border border-white/20 shadow-sm" />
                          </div>
                        )}
                        <p className="text-purple-200 mb-2">{project.description}</p>
                        {project.photos && (
                          <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-purple-300" />
                            <p className="text-sm text-purple-300">{project.photos.length} fotos</p>
                          </div>
                        )}
                        {project.createdAt && (
                          <p className="text-xs text-purple-400 mt-2">
                            Creado: {project.createdAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6 mt-6">
            {/* NOTA: Funcionalidad deshabilitada hasta completar pago */}
            <Card className="bg-yellow-500/20 backdrop-blur-md border-2 border-yellow-500/50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⏳</div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-200">Función en Desarrollo</h3>
                    <p className="text-yellow-100 text-sm">
                      La gestión de productos estará disponible próximamente. Por ahora puedes ver los productos mock en el shop.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center opacity-50 pointer-events-none">
              <h2 className="text-2xl font-semibold text-white">Gestión de Productos</h2>
              <Button
                disabled
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Nuevo Producto
              </Button>
            </div>

            {/* Grid de productos mock - Solo visualización */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none">
              {products.map((product) => (
                <Card key={product.id} className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                      <Badge
                        variant={
                          product.status === "available"
                            ? "default"
                            : product.status === "sold_out"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {product.status === "available"
                          ? "Disponible"
                          : product.status === "sold_out"
                          ? "Agotado"
                          : "Próximamente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-purple-200">
                      <strong>Precio:</strong> ${product.price}
                    </div>
                    <div className="text-sm text-purple-200">
                      <strong>Categoría:</strong> {product.category}
                    </div>
                    <div className="text-sm text-purple-200 line-clamp-2">
                      <strong>Descripción:</strong> {product.description}
                    </div>
                    <div className="text-sm text-purple-200">
                      <strong>Stock:</strong> {product.stock || 0} unidades
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button disabled size="sm" variant="outline" className="flex-1">
                        <Edit size={14} className="mr-1" />
                        Editar
                      </Button>
                      <Button disabled size="sm" variant="destructive" className="flex-1">
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Formulario de nuevo producto (deshabilitado) */}
            {showNewProduct && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 opacity-50 pointer-events-none">
                <CardHeader>
                  <CardTitle className="text-white">Agregar Nuevo Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-purple-200 mb-1 block">Nombre del Producto *</label>
                      <Input disabled placeholder="Ej: Camiseta KIKU Limited" className="bg-white/5 border-white/20 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-200 mb-1 block">Precio ($) *</label>
                      <Input disabled type="number" placeholder="45" className="bg-white/5 border-white/20 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-200 mb-1 block">Descripción *</label>
                    <Textarea disabled placeholder="Descripción del producto..." className="bg-white/5 border-white/20 text-white" rows={3} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-purple-200 mb-1 block">Categoría *</label>
                      <Select disabled>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ropa">Ropa</SelectItem>
                          <SelectItem value="accesorios">Accesorios</SelectItem>
                          <SelectItem value="arte">Arte</SelectItem>
                          <SelectItem value="libros">Libros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-200 mb-1 block">Estado *</label>
                      <Select disabled>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="sold_out">Agotado</SelectItem>
                          <SelectItem value="coming_soon">Próximamente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-200 mb-1 block">Stock</label>
                      <Input disabled type="number" placeholder="0" className="bg-white/5 border-white/20 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button disabled className="bg-gradient-to-r from-pink-500 to-purple-600">
                      <Save size={16} className="mr-2" />
                      Guardar Producto
                    </Button>
                    <Button disabled variant="outline">
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ProjectEditForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project
  onSave: (updates: Partial<Project>) => void
  onCancel: () => void
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(project)
  const [photoUrls, setPhotoUrls] = useState(project.photos?.map((p) => p.url).join("\n") || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Error",
        description: "El nombre del proyecto es obligatorio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Preservar las dimensiones existentes de las fotos que ya están
    const existingPhotoMap = new Map(
      project.photos?.map(p => [p.url, { width: p.width, height: p.height }]) || []
    )

    const urlList = photoUrls
      .split("\n")
      .filter((url) => url.trim())
      .map((url) => url.trim())

    // Función para obtener dimensiones de una imagen desde URL
    const getImageDimensionsFromUrl = (url: string): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
        }
        img.onerror = () => {
          console.error(`Error loading image: ${url}`)
          resolve({ width: 800, height: 600 }) // Fallback
        }
        img.src = url
      })
    }

    // Obtener dimensiones para URLs nuevas en paralelo
    const dimensionsPromises = urlList.map(async (url) => {
      const existingDimensions = existingPhotoMap.get(url)
      if (existingDimensions && existingDimensions.width && existingDimensions.height) {
        return existingDimensions
      }
      // Si es nueva URL o no tiene dimensiones, obtenerlas
      return await getImageDimensionsFromUrl(url)
    })

    try {
      const dimensions = await Promise.all(dimensionsPromises)

      const photos: Photo[] = urlList.map((url, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: url,
        title: `Foto ${index + 1}`,
        description: "",
        width: dimensions[index].width,
        height: dimensions[index].height,
      }))

      await onSave({
        ...formData,
        photos,
      })

      toast({
        title: "Proyecto actualizado",
        description: `El proyecto "${formData.name}" ha sido actualizado correctamente con dimensiones.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nombre del proyecto"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
      />
      <Textarea
        value={formData.description || ""}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Descripción"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        rows={3}
      />
      <Input
        value={formData.coverImage || ""}
        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
        placeholder="URL de imagen principal (cover)"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm text-purple-200">Tipo</label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as Project["type"] })}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photography">Fotografía</SelectItem>
              <SelectItem value="design">Diseño</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="illustration">Ilustración</SelectItem>
              <SelectItem value="file">Archivo</SelectItem>
              <SelectItem value="folder">Carpeta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-purple-200">Orden</label>
          <Input
            type="number"
            value={formData.order || 0}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            className="bg-white/20 border-white/30 text-white placeholder-purple-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-purple-200">Estado</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as Project["status"] })}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mostrar fotos existentes */}
      {project.photos && project.photos.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm text-purple-200 font-semibold">Fotos actuales ({project.photos.length})</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
            {project.photos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <img 
                  src={photo.url} 
                  alt={photo.title || `Foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-white/30"
                />
                <button
                  onClick={() => {
                    const urls = photoUrls.split("\n").filter(url => url.trim() !== photo.url)
                    setPhotoUrls(urls.join("\n"))
                    toast({
                      title: "Foto eliminada",
                      description: "La foto se eliminará al guardar los cambios",
                    })
                  }}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Textarea
        value={photoUrls}
        onChange={(e) => setPhotoUrls(e.target.value)}
        placeholder="URLs de fotos (una por línea) - Pega nuevas URLs aquí"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        rows={4}
      />
      <div className="text-xs text-purple-300">
        💡 Tip: Para diseños, puedes agregar múltiples URLs para crear un carrusel
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {isSaving ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Guardar
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <X size={16} className="mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function ProductEditForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (updates: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(product)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nombre del producto"
          className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        />
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          placeholder="Precio"
          className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        />
      </div>
      <Input
        value={formData.image}
        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        placeholder="URL de imagen"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Categoría"
          className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        />
        <Input
          type="number"
          value={formData.stock || ""}
          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          placeholder="Stock"
          className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        />
      </div>
      <Textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Descripción"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => onSave(formData)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Save size={16} className="mr-2" />
          Guardar
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <X size={16} className="mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
