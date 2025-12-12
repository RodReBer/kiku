"use client"
import { useEffect, useState, useRef } from "react"
import DrawingTool from "./drawing-tool"

export default function DrawingApp() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        // Subtract a small amount for padding if necessary, or use full size
        // The container has p-1 md:p-4. We want the canvas to fit within that.
        // clientWidth is the inner width including padding.
        // We should probably subtract the padding to get the available content area?
        // Actually, let's just use the container's content box if possible.
        // But getComputedStyle is expensive.
        // Let's just rely on the container being the wrapper around the DrawingTool.
        // DrawingTool renders a toolbar + canvas.
        // We want the canvas to take the remaining space.
        // DrawingTool takes width/height for the CANVAS itself?
        // Looking at DrawingTool, it renders a toolbar and then a div with the canvas.
        // The canvas has width={width} height={height}.
        // So we should pass the available space for the canvas.
        // But DrawingTool has a toolbar of variable height.
        // This is tricky.

        // Let's set dimensions to the container size, and let DrawingTool handle the layout?
        // DrawingTool uses the width/height props for the <canvas> element directly.
        // So we need to subtract the toolbar height from the passed height.
        // Toolbar is approx 40-50px.

        const toolbarHeight = window.innerWidth < 768 ? 80 : 50; // Estimate
        setDimensions({
          width: clientWidth - (window.innerWidth < 768 ? 8 : 32), // minus padding (p-1=4px*2 or p-4=16px*2)
          height: clientHeight - toolbarHeight - (window.innerWidth < 768 ? 8 : 32)
        })
      }
    }

    // Initial update
    updateDimensions()

    // Observer
    const observer = new ResizeObserver(() => {
      // Debounce?
      window.requestAnimationFrame(updateDimensions)
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full flex items-start justify-center bg-gray-100 p-1 md:p-4 overflow-hidden">
      <DrawingTool width={dimensions.width} height={dimensions.height} />
    </div>
  )
}
