"use client"

import { useState } from "react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: string
  description: string
  category: "stickers" | "prints" | "digital"
  status: "active"
  imageIcon: string // Path al icono del producto
}

export default function ShopWindow() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "stickers" | "prints" | "digital">("all")

  const products: Product[] = [
    {
      id: "1",
      name: "Pack Stickers KIKU Retro",
      price: "$15.000",
      description: "Pack de 10 stickers retro inspirados en El Cuartito. ¡Pégalos donde quieras!",
      category: "stickers",
      status: "active",
      imageIcon: "/icons/diseno.png",
    },
    {
      id: "2",
      name: "Stickers Personalizados",
      price: "$20.000",
      description: "Crea tus propios stickers con diseños aesthetic únicos. Ideal para tu laptop o agenda.",
      category: "stickers",
      status: "active",
      imageIcon: "/icons/diseno.png",
    },
    {
      id: "3",
      name: "Print A3 El Cuartito",
      price: "$25.000",
      description: "Impresión A3 de alta calidad de una escena icónica de El Cuartito. Arte para tus paredes.",
      category: "prints",
      status: "active",
      imageIcon: "/icons/contacto.png", // Usando contacto como placeholder para prints
    },
    {
      id: "4",
      name: "Canvas Print Premium",
      price: "$45.000",
      description: "Impresión en canvas premium de El Cuartito. Calidad de galería para tu hogar.",
      category: "prints",
      status: "active",
      imageIcon: "/icons/contacto.png",
    },
    {
      id: "5",
      name: "Logo Digital Retro",
      price: "$50.000",
      description: "Diseño de logo personalizado con estética retro para tu marca o proyecto.",
      category: "digital",
      status: "active",
      imageIcon: "/icons/escritorio.png", // Usando escritorio como placeholder para digital
    },
    {
      id: "6",
      name: "Pack Wallpapers KIKU",
      price: "$25.000",
      description: "Colección de wallpapers aesthetic de El Cuartito para tu PC y móvil.",
      category: "digital",
      status: "active",
      imageIcon: "/icons/escritorio.png",
    },
  ]

  const filteredProducts = products.filter((product) => {
    return selectedCategory === "all" || product.category === selectedCategory
  })

  const handleBuyClick = (product: Product) => {
    const message = `¡Hola KIKU! Me interesa comprar este producto:
Producto: ${product.name}
Precio: ${product.price}
Descripción: ${product.description}
¡Quisiera saber más! 😊`
    const whatsappUrl = `https://wa.me/5491234567890?text=${encodeURIComponent(message)}` // Reemplaza con tu número
    window.open(whatsappUrl, "_blank")
  }

  const categoryButtons = [
    { label: "Todos", category: "all" as "all" | "stickers" | "prints" | "digital", icon: null },
    { label: "Stickers", category: "stickers" as "all" | "stickers" | "prints" | "digital", icon: "/icons/diseno.png" },
    { label: "Prints", category: "prints" as "all" | "stickers" | "prints" | "digital", icon: "/icons/contacto.png" },
    {
      label: "Digital",
      category: "digital" as "all" | "stickers" | "prints" | "digital",
      icon: "/icons/escritorio.png",
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-200 font-mono">
      {/* Header */}
      <div className="bg-gray-300 p-2 sm:p-3 border-b-2 border-gray-400" style={{ borderStyle: "outset" }}>
        <h1 className="text-base sm:text-lg font-bold text-black">TIENDA KIKU CREAM</h1>
        <p className="text-xs sm:text-sm text-gray-700">Stickers, prints y diseños digitales con onda retro</p>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Sidebar */}
        <div
          className="w-full sm:w-48 bg-gray-200 border-b-2 sm:border-b-0 sm:border-r-2 border-gray-400 p-2 sm:p-4"
          style={{ borderStyle: "inset" }}
        >
          <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-x-hidden pb-2 sm:pb-0">
            {categoryButtons.map((btn) => (
              <button
                key={btn.category}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === btn.category
                    ? "bg-blue-600 text-white border-2 border-blue-800"
                    : "bg-gray-300 hover:bg-gray-100 text-black border border-gray-400"
                }`}
                style={{ borderStyle: selectedCategory === btn.category ? "inset" : "outset" }}
                onClick={() => setSelectedCategory(btn.category)}
              >
                {btn.icon && (
                  <Image
                    src={btn.icon || "/placeholder.svg"}
                    alt={btn.label}
                    width={12}
                    height={12}
                    className="pixelated hidden sm:inline"
                  />
                )}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-2 sm:p-4 overflow-auto bg-white">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-100 border-2 border-gray-400 p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                  style={{ borderStyle: "outset" }}
                >
                  <div>
                    <div className="text-center mb-3">
                      <div
                        className="bg-white border border-gray-300 p-2 sm:p-3 mb-2 inline-block"
                        style={{ borderStyle: "inset" }}
                      >
                        <Image
                          src={product.imageIcon || "/placeholder.svg"}
                          alt={product.name}
                          width={24}
                          height={24}
                          className="pixelated sm:w-8 sm:h-8"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-black mb-1 truncate">{product.name}</h3>
                      <p
                        className="text-lg sm:text-xl font-black text-green-700 mb-2 bg-yellow-200 px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-yellow-400 inline-block"
                        style={{ borderStyle: "outset" }}
                      >
                        {product.price}
                      </p>
                    </div>
                    <p
                      className="text-xs sm:text-sm text-gray-700 mb-3 bg-gray-200 p-2 border border-gray-400 min-h-[60px] sm:min-h-[80px]"
                      style={{ borderStyle: "inset" }}
                    >
                      {product.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuyClick(product)}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 border-2 border-green-700 transition-all duration-200 shadow-sm text-xs sm:text-sm"
                    style={{ borderStyle: "outset" }}
                  >
                    COMPRAR (WHATSAPP)
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Image
                src="/icons/compras.png"
                alt="Sin productos"
                width={48}
                height={48}
                className="pixelated opacity-50 mb-4"
              />
              <p className="text-lg font-semibold">¡Ups! No hay productos aquí.</p>
              <p className="text-sm">Prueba seleccionando otra categoría o vuelve más tarde.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-300 p-1.5 sm:p-2 border-t-2 border-gray-400 text-xs" style={{ borderStyle: "inset" }}>
        <span className="text-black font-bold">{filteredProducts.length} producto(s) encontrado(s)</span>
      </div>
    </div>
  )
}
