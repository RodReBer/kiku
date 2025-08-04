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
import { Trash2, Edit, Plus, Save, X, RefreshCw, ImageIcon, Folder, Check, Archive } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Project, Product, Photo } from "@/context/data-context"

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
    type: "photography",
    category: "photography",
    description: "",
    status: "active",
    photos: [],
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

  const [photoUrls, setPhotoUrls] = useState("")

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.type || !newProject.category) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    // Procesar URLs de fotos
    const photos: Photo[] = photoUrls
      .split("\n")
      .filter((url) => url.trim())
      .map((url, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: url.trim(),
        title: `Foto ${index + 1}`,
        description: "",
      }))

    try {
      await addProject({
        ...(newProject as Omit<Project, "id">),
        photos,
      })

      setNewProject({
        name: "",
        type: "photography",
        category: "photography",
        description: "",
        status: "active",
        photos: [],
      })
      setPhotoUrls("")
      setShowNewProject(false)
    } catch (err) {
      console.error("Error adding project:", err)
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
                      <label className="block text-purple-200 text-sm font-medium mb-2">Tipo</label>
                      <Select
                        value={newProject.type || ""}
                        onValueChange={(value) => setNewProject({ ...newProject, type: value as Project["type"] })}
                      >
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700">
                          <SelectItem value="photography">📸 Fotografía</SelectItem>
                          <SelectItem value="design">🎨 Diseño</SelectItem>
                          <SelectItem value="illustration">✏️ Ilustración</SelectItem>
                          <SelectItem value="file">📄 Archivo</SelectItem>
                          <SelectItem value="folder">📁 Carpeta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="design">🎨 Diseño</SelectItem>
                          <SelectItem value="photography">📸 Fotografía</SelectItem>
                          <SelectItem value="general">📋 General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Estado</label>
                      <Select
                        value={newProject.status || ""}
                        onValueChange={(value) => setNewProject({ ...newProject, status: value as Project["status"] })}
                      >
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700">
                          <SelectItem value="active">✅ Activo</SelectItem>
                          <SelectItem value="archived">📦 Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">Descripción</label>
                    <Textarea
                      placeholder="Describe tu proyecto..."
                      value={newProject.description || ""}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      URLs de Fotos (una por línea)
                    </label>
                    <Textarea
                      placeholder="https://ejemplo.com/foto1.jpg&#10;https://ejemplo.com/foto2.jpg&#10;https://ejemplo.com/foto3.jpg"
                      value={photoUrls}
                      onChange={(e) => setPhotoUrls(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      rows={6}
                    />
                    <p className="text-purple-300 text-xs mt-1">
                      💡 Pega aquí los links de tus fotos de Firebase Storage o cualquier URL pública
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddProject}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Save size={16} className="mr-2" />
                      Crear Proyecto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewProject(false)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {projects.map((project) => (
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
                            const newStatus = project.status === "active" ? "archived" : "active";
                            const success = await updateProject(project.id, { status: newStatus });
                            
                            if (success) {
                              toast({
                                title: "Estado actualizado",
                                description: `El proyecto "${project.name}" ha sido ${newStatus === "active" ? "activado" : "archivado"}.`,
                                variant: "default",
                              });
                            } else {
                              toast({
                                title: "Error al actualizar",
                                description: "No se pudo cambiar el estado del proyecto. Intente nuevamente.",
                                variant: "destructive",
                              });
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Gestión de Productos</h2>
              <Button
                onClick={() => setShowNewProduct(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Plus size={16} className="mr-2" />
                Nuevo Producto
              </Button>
            </div>

            {showNewProduct && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus size={20} className="mr-2" />
                    Crear Nuevo Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Nombre del Producto</label>
                      <Input
                        placeholder="Ej: Print Fotográfico A4"
                        value={newProduct.name || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Precio ($)</label>
                      <Input
                        type="number"
                        placeholder="15000"
                        value={newProduct.price || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">URL de Imagen</label>
                    <Input
                      placeholder="https://ejemplo.com/producto.jpg"
                      value={newProduct.image || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Categoría</label>
                      <Input
                        placeholder="prints, stickers, digital..."
                        value={newProduct.category || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Stock</label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={newProduct.stock || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">Descripción</label>
                    <Textarea
                      placeholder="Describe tu producto..."
                      value={newProduct.description || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder-purple-300"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddProduct}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Save size={16} className="mr-2" />
                      Crear Producto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewProduct(false)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center">💰 {product.name}</CardTitle>
                        <p className="text-2xl font-bold text-green-400 mt-1">${product.price.toLocaleString()}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="border-purple-400 text-purple-200">
                            {product.category}
                          </Badge>
                          <Badge
                            variant={product.status === "available" ? "default" : "secondary"}
                            className={
                              product.status === "available"
                                ? "bg-green-500/30 text-green-200"
                                : product.status === "sold_out"
                                  ? "bg-red-500/30 text-red-200"
                                  : "bg-yellow-500/30 text-yellow-200"
                            }
                          >
                            {product.status === "available" && "✅ Disponible"}
                            {product.status === "sold_out" && "❌ Agotado"}
                            {product.status === "coming_soon" && "⏳ Próximamente"}
                          </Badge>
                          {product.stock && (
                            <Badge variant="secondary" className="bg-blue-500/30 text-blue-200">
                              Stock: {product.stock}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product.id)}
                          disabled={editingProduct === product.id}
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500/30 border-red-500/50 text-red-200 hover:bg-red-500/50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingProduct === product.id ? (
                      <ProductEditForm
                        product={product}
                        onSave={async (updates) => {
                          await updateProduct(product.id, updates)
                          setEditingProduct(null)
                        }}
                        onCancel={() => setEditingProduct(null)}
                      />
                    ) : (
                      <div>
                        <p className="text-purple-200 mb-2">{product.description}</p>
                        {product.image && (
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={16} className="text-purple-300" />
                            <a
                              href={product.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-300 hover:text-blue-200 underline"
                            >
                              Ver imagen
                            </a>
                          </div>
                        )}
                        {product.createdAt && (
                          <p className="text-xs text-purple-400 mt-2">
                            Creado: {product.createdAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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
    
    const photos: Photo[] = photoUrls
      .split("\n")
      .filter((url) => url.trim())
      .map((url, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: url.trim(),
        title: `Foto ${index + 1}`,
        description: "",
      }))

    try {
      await onSave({
        ...formData,
        photos,
      })
      
      toast({
        title: "Proyecto actualizado",
        description: `El proyecto "${formData.name}" ha sido actualizado correctamente.`,
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
              <SelectItem value="illustration">Ilustración</SelectItem>
              <SelectItem value="file">Archivo</SelectItem>
              <SelectItem value="folder">Carpeta</SelectItem>
            </SelectContent>
          </Select>
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
      <Textarea
        value={photoUrls}
        onChange={(e) => setPhotoUrls(e.target.value)}
        placeholder="URLs de fotos (una por línea)"
        className="bg-white/20 border-white/30 text-white placeholder-purple-300"
        rows={4}
      />
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
