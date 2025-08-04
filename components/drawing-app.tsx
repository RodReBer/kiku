"use client"
import DrawingTool from "./drawing-tool"

export default function DrawingApp() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      <DrawingTool width={900} height={600} />
    </div>
  )
}
