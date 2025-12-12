"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Photo {
  id: string
  url: string
  thumbUrl?: string // URL del thumbnail para carga rápida en cascadas
  width?: number
  height?: number
  title: string
  description?: string
}

export interface Project {
  id: string
  name: string
  type: "photography" | "design" | "illustration" | "video" | "file" | "folder"
  category: "design" | "photography" | "video" | "general"
  photos?: Photo[]
  description?: string
  status: "active" | "archived"
  coverImage?: string
  coverImageThumb?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
  status: "available" | "sold_out" | "coming_soon"
  stock?: number
  createdAt?: Date
  updatedAt?: Date
}

interface DataContextType {
  projects: Project[]
  products: Product[]
  loading: boolean
  error: string | null
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  addProject: (project: Omit<Project, "id">) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales y configurar listeners en tiempo real
  useEffect(() => {
    console.log("Initializing Firebase listeners");

    const projectsCollectionRef = collection(db, "projects");
    console.log("Projects collection reference:", projectsCollectionRef);

    const unsubscribeProjects = onSnapshot(
      projectsCollectionRef,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }) as Project[];

        setProjects(projectsData);
        console.log("Projects set in state:", projectsData.length);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading projects:", err)
        setError("Error cargando proyectos")
        setLoading(false)
      },
    )

    const unsubscribeProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        // Si hay productos en Firebase, usarlos; sino, mantener mocks
        if (snapshot.docs.length > 0) {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Product[]
          setProducts(productsData)
        }
        // Si no hay productos en Firebase, mantener los mocks (ya inicializados)
      },
      (err) => {
        console.error("Error loading products:", err)
        // Mantener mocks en caso de error
      },
    )

    return () => {
      unsubscribeProjects()
      unsubscribeProducts()
    }
  }, [])

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      console.log(`Updating project ${id} with:`, updates)
      const projectRef = doc(db, "projects", id)
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }
      await updateDoc(projectRef, updateData)
      console.log(`Project ${id} updated successfully`)
    } catch (err) {
      console.error("Error updating project:", err)
      let message = "Error actualizando proyecto"
      if (err && typeof err === 'object' && 'message' in err) {
        message = `Error actualizando proyecto: ${(err as any).message}`
      }
      setError(message)
    }
  }

  const addProject = async (project: Omit<Project, "id">) => {
    try {
      await addDoc(collection(db, "projects"), {
        ...project,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (err) {
      console.error("Error adding project:", err)
      setError("Error añadiendo proyecto")
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id))
    } catch (err) {
      console.error("Error deleting project:", err)
      setError("Error eliminando proyecto")
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, "products", id), {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Error actualizando producto")
    }
  }

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error añadiendo producto")
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id))
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Error eliminando producto")
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const [projectsSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "products")),
      ])

      const projectsData = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Project[]

      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[]

      setProjects(projectsData)
      setProducts(productsData)
      setError(null)
    } catch (err) {
      console.error("Error refreshing data:", err)
      setError("Error refrescando datos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DataContext.Provider
      value={{
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
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
