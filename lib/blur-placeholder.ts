// Genera un blur placeholder tiny para Next.js Image
// Usa un color sólido promedio basado en hash del URL

export function generateBlurDataURL(src: string): string {
  // Hash simple del src para generar color consistente
  let hash = 0
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Convertir hash a RGB suave (tonos grises/neutros para fotos)
  const r = Math.abs((hash & 0xFF) % 200) + 55
  const g = Math.abs(((hash >> 8) & 0xFF) % 200) + 55
  const b = Math.abs(((hash >> 16) & 0xFF) % 200) + 55
  
  // Generar SVG blur de 10x10px
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="rgb(${r},${g},${b})"/>
      <filter id="blur">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
      <rect width="10" height="10" fill="rgb(${r},${g},${b})" filter="url(#blur)"/>
    </svg>
  `.trim()
  
  // Base64 encode
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// Blur genérico gris neutro (fallback)
export const DEFAULT_BLUR_DATA_URL = 
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJyZ2IoMjAwLDIwMCwyMDApIi8+PC9zdmc+"
