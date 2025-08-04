"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eraser, Paintbrush, Undo2, Redo2, Download, Palette, Plus, Minus } from "lucide-react"

interface DrawingToolProps {
  width?: number
  height?: number
  initialImage?: string
}

export default function DrawingTool({ width = 800, height = 600, initialImage }: DrawingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState("#000000")
  const [isErasing, setIsErasing] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    return ctx
  }, [])

  const saveState = useCallback(() => {
    const ctx = getCanvasContext()
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1)
        return [...newHistory, imageData]
      })
      setHistoryIndex(prevIndex => prevIndex + 1)
    }
  }, [getCanvasContext, historyIndex])

  const restoreState = useCallback(
    (index: number) => {
      const ctx = getCanvasContext()
      if (ctx && history[index]) {
        ctx.putImageData(history[index], 0, 0)
      }
    },
    [getCanvasContext, history],
  )

  useEffect(() => {
    const ctx = getCanvasContext()
    if (ctx) {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Load initial image if provided
      if (initialImage) {
        const img = new window.Image() // Usar window.Image para acceder al constructor nativo
        img.crossOrigin = "anonymous" // To avoid CORS issues if image is from different origin
        img.onload = () => {
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          // Initialize with the first state directly
          const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
          setHistory([imageData])
          setHistoryIndex(0)
        }
        img.src = initialImage
      } else {
        // Clear canvas and initialize with a blank state
        ctx.clearRect(0, 0, width, height)
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
        setHistory([imageData])
        setHistoryIndex(0)
      }
    }
  }, [getCanvasContext, width, height, initialImage])

  useEffect(() => {
    const ctx = getCanvasContext()
    if (ctx) {
      ctx.strokeStyle = isErasing ? "#FFFFFF" : brushColor // Use white for eraser
      ctx.lineWidth = brushSize
      ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over" // Eraser effect
    }
  }, [brushSize, brushColor, isErasing, getCanvasContext])

  const startDrawing = useCallback(
    ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
      const { offsetX, offsetY } = nativeEvent
      const ctx = getCanvasContext()
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(offsetX, offsetY)
        setIsDrawing(true)
      }
    },
    [getCanvasContext],
  )

  const draw = useCallback(
    ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      const { offsetX, offsetY } = nativeEvent
      const ctx = getCanvasContext()
      if (ctx) {
        ctx.lineTo(offsetX, offsetY)
        ctx.stroke()
      }
    },
    [isDrawing, getCanvasContext],
  )

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      saveState()
    }
  }, [isDrawing, saveState])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      restoreState(newIndex)
      setHistoryIndex(newIndex)
    }
  }, [historyIndex, restoreState])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      restoreState(newIndex)
      setHistoryIndex(newIndex)
    }
  }, [historyIndex, history.length, restoreState])

  const clearCanvas = useCallback(() => {
    const ctx = getCanvasContext()
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      saveState()
    }
  }, [getCanvasContext, saveState])

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = "kiku-paint-drawing.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-gray-200 border-2 border-gray-400" style={{ borderStyle: "inset" }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 p-2 bg-gray-300 border-b-2 border-gray-400"
        style={{ borderStyle: "outset" }}
      >
        <Button
          onClick={() => setIsErasing(false)}
          className={`p-2 ${!isErasing ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} border border-gray-400`}
          style={{ borderStyle: !isErasing ? "inset" : "outset" }}
          size="sm"
        >
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Pincel</span>
        </Button>
        <Button
          onClick={() => setIsErasing(true)}
          className={`p-2 ${isErasing ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} border border-gray-400`}
          style={{ borderStyle: isErasing ? "inset" : "outset" }}
          size="sm"
        >
          <Eraser className="h-4 w-4" />
          <span className="sr-only">Borrador</span>
        </Button>

        <div
          className="flex items-center gap-1 bg-gray-200 border border-gray-400 p-1"
          style={{ borderStyle: "inset" }}
        >
          <Button
            onClick={() => setBrushSize((prev) => Math.max(1, prev - 1))}
            className="p-1 h-auto w-auto bg-gray-200 text-black border border-gray-400"
            style={{ borderStyle: "outset" }}
            size="sm"
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Reducir tamaño</span>
          </Button>
          <span className="text-sm text-black">{brushSize}px</span>
          <Button
            onClick={() => setBrushSize((prev) => Math.min(50, prev + 1))}
            className="p-1 h-auto w-auto bg-gray-200 text-black border border-gray-400"
            style={{ borderStyle: "outset" }}
            size="sm"
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Aumentar tamaño</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="color-picker" className="sr-only">
            Color
          </Label>
          <Input
            id="color-picker"
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="h-8 w-8 p-0 border-none cursor-pointer"
            title="Seleccionar color"
          />
          <Palette className="h-4 w-4 text-black" />
        </div>

        <Button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 bg-gray-200 text-black border border-gray-400 disabled:opacity-50"
          style={{ borderStyle: "outset" }}
          size="sm"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Deshacer</span>
        </Button>
        <Button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 bg-gray-200 text-black border border-gray-400 disabled:opacity-50"
          style={{ borderStyle: "outset" }}
          size="sm"
        >
          <Redo2 className="h-4 w-4" />
          <span className="sr-only">Rehacer</span>
        </Button>
        <Button
          onClick={clearCanvas}
          className="p-2 bg-gray-200 text-black border border-gray-400"
          style={{ borderStyle: "outset" }}
          size="sm"
        >
          Limpiar
          <span className="sr-only">Limpiar lienzo</span>
        </Button>
        <Button
          onClick={downloadImage}
          className="p-2 bg-gray-200 text-black border border-gray-400"
          style={{ borderStyle: "outset" }}
          size="sm"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Descargar</span>
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white border-2 border-gray-400 cursor-crosshair"
          style={{ borderStyle: "inset" }}
        />
      </div>
    </div>
  )
}
