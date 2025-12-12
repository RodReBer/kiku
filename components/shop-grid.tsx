"use client"

import { useState } from "react"
import Image from "next/image"
import { Product } from "@/context/data-context"

interface ShopGridProps {
  products: Product[]
}

export default function ShopGrid({ products }: ShopGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "available":
        return (
          <div className="bg-green-500 text-white px-2 py-1 text-xs font-bold">
            DISPONIBLE
          </div>
        )
      case "sold_out":
        return (
          <div className="bg-red-500 text-white px-2 py-1 text-xs font-bold">
            AGOTADO
          </div>
        )
      case "coming_soon":
        return (
          <div className="bg-yellow-500 text-black px-2 py-1 text-xs font-bold">
            PRÓXIMAMENTE
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-[#c0c0c0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#000080] text-white px-4 py-2 font-bold text-sm">
        🛍️ KIKU CREAM SHOP
      </div>

      {/* Grid de productos */}
      {products.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border-2 border-[#808080] cursor-pointer hover:border-[#000080] transition-all"
            style={{ borderStyle: "outset" }}
            onClick={() => setSelectedProduct(product)}
          >
            {/* Imagen del producto */}
            <div className="relative w-full aspect-square bg-gray-100 border-b-2 border-[#808080]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
              {/* Badge de estado */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.status)}
              </div>
            </div>

            {/* Info del producto */}
            <div className="p-2">
              <h3 className="font-bold text-xs text-black mb-1 line-clamp-1">
                {product.name}
              </h3>
              <div className="text-lg font-bold text-[#000080]">
                ${product.price}
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      )}

      {/* Modal de detalle del producto */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#c0c0c0] border-4 border-white max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ borderStyle: "outset" }}
          >
            {/* Header del modal */}
            <div className="bg-[#000080] text-white px-3 py-2 flex justify-between items-center">
              <span className="font-bold text-sm">{selectedProduct.name}</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:text-red-300 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              {/* Imagen */}
              <div className="relative w-full aspect-square bg-white border-2 border-[#808080] mb-4">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-contain p-6"
                />
              </div>

              {/* Información */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-black">Descripción:</label>
                  <p className="text-sm text-gray-700 bg-white border-2 border-[#808080] p-2 mt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-black">Precio:</label>
                  <p className="text-3xl font-bold text-[#000080] bg-white border-2 border-[#808080] p-3 mt-1 text-center">
                    ${selectedProduct.price}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-black">Estado:</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedProduct.status)}
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  disabled={selectedProduct.status !== "available"}
                  className={`w-full py-3 border-2 font-bold text-sm ${
                    selectedProduct.status === "available"
                      ? "bg-[#000080] text-white hover:bg-[#0000a0] cursor-pointer"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                  style={{ borderStyle: "outset" }}
                >
                  {selectedProduct.status === "available"
                    ? "AGREGAR AL CARRITO"
                    : selectedProduct.status === "sold_out"
                    ? "AGOTADO"
                    : "DISPONIBLE PRÓXIMAMENTE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si no hay productos */}
      {products.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#808080] p-6 md:p-8 max-w-md w-full mx-auto" style={{ borderStyle: "outset" }}>
            <div className="text-center mb-4 md:mb-6">
              <div className="text-5xl md:text-6xl mb-3">🛒</div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-2">Coming Soon...</h2>
              <p className="text-xs md:text-sm text-gray-600">
                Nuestra tienda online está en construcción. Pronto podrás comprar prints, stickers y productos exclusivos de KIKU.
              </p>
            </div>
            
            <div className="bg-yellow-200 border-4 border-[#808080] p-3 md:p-4" style={{ borderStyle: "groove" }}>
              <p className="text-black font-bold text-xs md:text-sm mb-2 flex items-center justify-center gap-2">
                <span>⏳</span>
                <span>Disponible próximamente</span>
              </p>
              <p className="text-xs text-gray-700 text-center">
                Mientras tanto, contáctanos para pedidos personalizados
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
