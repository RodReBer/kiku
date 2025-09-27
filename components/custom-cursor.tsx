"use client"
import { useEffect } from "react"

/**
 * Dynamically scales the original 84x84 cursor image to a smaller size (default 42x42)
 * so you don't need to manually create another asset.
 * Hotspot can be 'center' (precision in middle) or 'topleft' (precision at 0,0 like un puntero clásico).
 */
export function CustomCursor({ size = 42, hotspot = "center" as "center" | "topleft" }) {
  useEffect(() => {
    const img = new Image()
    img.src = "/MOUSSE-KIKU.png"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(img, 0, 0, size, size)
        const url = canvas.toDataURL("image/png")
        const x = hotspot === "center" ? Math.floor(size / 2) : 0
        const y = hotspot === "center" ? Math.floor(size / 2) : 0

        // Apply globally (root) as fallback
        document.documentElement.style.cursor = `url(${url}) ${x} ${y}, default`

        // Inject / update style for class-based override
        let styleEl = document.getElementById("__cursor-style") as HTMLStyleElement | null
        if (!styleEl) {
          styleEl = document.createElement("style")
          styleEl.id = "__cursor-style"
          document.head.appendChild(styleEl)
        }
        styleEl.innerHTML = `.kiku-cursor, .kiku-cursor * { cursor: url(${url}) ${x} ${y}, auto !important; }`
      } catch (e) {
        console.warn("CustomCursor scaling failed", e)
      }
    }
  }, [size, hotspot])
  return null
}

export default CustomCursor
