/**
 * Genera una versión thumbnail de una imagen o video
 * @param file - Archivo de imagen/video original
 * @param maxSize - Tamaño máximo del lado más largo (default: 400px)
 * @returns Promise con el archivo thumbnail
 */
export async function generateThumbnail(file: File, maxSize: number = 400): Promise<File> {
  // Si es un video, retornar el archivo original (no generar thumbnail)
  if (file.type.startsWith('video/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'))
          return
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir a Blob con máxima calidad para thumbnails
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo crear el blob'))
              return
            }
            
            // Crear nuevo File con el blob
            const thumbnailFile = new File(
              [blob],
              `thumb_${file.name}`,
              { type: file.type }
            )
            
            resolve(thumbnailFile)
          },
          file.type,
          1 // Calidad 100% para thumbnails (muy buena calidad pero archivo más pequeño)
        )
      }
      
      img.onerror = () => {
        reject(new Error('Error cargando la imagen'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Error leyendo el archivo'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Genera thumbnails para múltiples archivos
 * @param files - Array de archivos
 * @param maxSize - Tamaño máximo del lado más largo
 * @returns Promise con array de thumbnails
 */
export async function generateThumbnails(
  files: File[],
  maxSize: number = 400
): Promise<File[]> {
  const promises = files.map(file => generateThumbnail(file, maxSize))
  return Promise.all(promises)
}
