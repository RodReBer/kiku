import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Sube una imagen a Firebase Storage
 * @param file - Archivo a subir
 * @param path - Ruta donde se guardará (ej: 'projects/design/imagen.jpg')
 * @returns URL de descarga de la imagen
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Error al subir la imagen")
  }
}

/**
 * Elimina una imagen de Firebase Storage
 * @param url - URL de la imagen a eliminar
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extraer el path de la URL
    const urlObj = new URL(url)
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1]?.split('?')[0])
    if (!path) throw new Error("Invalid URL")
    
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Error al eliminar la imagen")
  }
}

/**
 * Sube múltiples imágenes a Firebase Storage
 * @param files - Array de archivos a subir
 * @param basePath - Ruta base donde se guardarán (ej: 'projects/photography/album-1')
 * @returns Array de URLs de descarga
 */
export async function uploadMultipleImages(
  files: File[],
  basePath: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) => {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${index}-${file.name}`
      const path = `${basePath}/${fileName}`
      return uploadImage(file, path)
    })
    
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error("Error uploading multiple images:", error)
    throw new Error("Error al subir las imágenes")
  }
}

/**
 * Genera un path único para un proyecto
 * @param category - Categoría del proyecto (design, photography, video)
 * @param projectName - Nombre del proyecto
 * @returns Path para usar en Storage
 */
export function generateProjectPath(
  category: "design" | "photography" | "video" | "general",
  projectName: string
): string {
  const timestamp = Date.now()
  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
  
  return `projects/${category}/${sanitizedName}-${timestamp}`
}
