"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, FileText, ImageIcon, FolderIcon } from "lucide-react"

const getRandomPosition = () => ({
  x: Math.random() * 80 + 10, // %
  y: Math.random() * 70 + 10, // %
  rotate: Math.random() * 60 - 30, // degrees
})

const initialFiles = [
  {
    id: "1",
    name: "calcetines_perdidos.doc",
    icon: <FileText size={24} className="text-gray-700" />,
    pos: getRandomPosition(),
  },
  {
    id: "2",
    name: "fotos_del_alien.jpg",
    icon: <ImageIcon size={24} className="text-blue-500" />,
    pos: getRandomPosition(),
  },
  {
    id: "3",
    name: "ideas_millonarias",
    icon: <FolderIcon size={24} className="text-yellow-600" />,
    pos: getRandomPosition(),
  },
  {
    id: "4",
    name: "mi_dieta_secreta.txt",
    icon: <FileText size={24} className="text-gray-700" />,
    pos: getRandomPosition(),
  },
  {
    id: "5",
    name: "contraseñas_obvias.pdf",
    icon: <FileText size={24} className="text-red-500" />,
    pos: getRandomPosition(),
  },
]

export default function TrashWindow() {
  const [files, setFiles] = useState(initialFiles)
  const [emptying, setEmptying] = useState(false)
  const [showCredits, setShowCredits] = useState(false)

  const handleDragEnd = (fileId: string) => {
    // Simular que el archivo es "tragado" por la papelera
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId))
  }

  const handleEmptyTrash = () => {
    setEmptying(true)
    // Simular vaciado
    setTimeout(() => {
      setFiles([])
      setEmptying(false)
      setShowCredits(true)
      setTimeout(() => setShowCredits(false), 3000)
    }, 1500)
  }

  useEffect(() => {
    // Pequeña animación al montar
    const timer = setTimeout(() => {
      setFiles(initialFiles.map((f) => ({ ...f, pos: getRandomPosition() })))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full w-full flex flex-col bg-gray-300 text-black font-mono overflow-hidden border-2 border-outset border-gray-500">
      <div className="p-2 bg-blue-700 text-white flex justify-between items-center border-b-2 border-outset border-gray-500">
        <div className="flex items-center">
          <Trash2 size={16} className="mr-2" />
          <span>Papelera de Reciclaje KIKU</span>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden bg-gray-200 border-t-2 border-inset border-gray-100">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              drag
              dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} // Limitar un poco el arrastre
              dragElastic={0.5}
              onDragEnd={() => handleDragEnd(file.id)}
              className="absolute p-2 bg-white border border-gray-400 shadow-md rounded cursor-grab active:cursor-grabbing flex flex-col items-center w-28 text-center"
              initial={{ opacity: 0, scale: 0.5, x: "50%", y: "50%" }}
              animate={{ opacity: 1, scale: 1, x: `${file.pos.x}%`, y: `${file.pos.y}%`, rotate: file.pos.rotate }}
              exit={{ opacity: 0, scale: 0, y: "150%", transition: { duration: 0.5 } }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              style={{
                // Evitar que se salgan completamente
                maxWidth: "calc(100% - 10px)",
                maxHeight: "calc(100% - 10px)",
              }}
            >
              {file.icon}
              <span className="text-xs mt-1 truncate w-full">{file.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Agujero de la papelera (visual) */}
        <motion.div
          className="absolute bottom-4 right-4 w-20 h-20 sm:w-28 sm:h-28 bg-gray-800 rounded-full flex items-center justify-center shadow-inner-lg"
          animate={{ scale: emptying ? [1, 1.3, 0.8, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, times: [0, 0.2, 0.5, 0.8, 1] }}
        >
          <Trash2 size={32} className={`text-gray-500 ${emptying ? "animate-ping" : ""}`} />
        </motion.div>

        {files.length === 0 && !emptying && !showCredits && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Trash2 size={64} className="mb-4 opacity-50" />
            <p className="text-lg">La papelera está vacía.</p>
            <p className="text-xs mt-2">(Probablemente porque te comiste todos los archivos)</p>
          </div>
        )}
        <AnimatePresence>
          {showCredits && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-green-400 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-2xl animate-pulse">¡ADIÓS ARCHIVOS!</p>
              <p className="mt-2 text-sm">(Fueron deliciosos)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-2 bg-gray-300 border-t-2 border-inset border-gray-400 flex justify-between items-center text-xs">
        <span>{files.length} objeto(s)</span>
        <button
          onClick={handleEmptyTrash}
          disabled={files.length === 0 || emptying}
          className="px-3 py-1 bg-gray-100 border border-outset border-gray-400 hover:bg-gray-50 active:border-inset active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {emptying ? "Vaciando..." : "Vaciar Papelera"}
        </button>
      </div>
    </div>
  )
}
