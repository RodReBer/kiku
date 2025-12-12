// lib/data.ts
// Este archivo ahora solo define las interfaces y los datos iniciales.
// El estado mutable se gestiona en el contexto.

export interface Photo {
  id: string
  name: string
  url: string
  width?: number
  height?: number
}

export interface Project {
  id: string
  name: string
  type: "design" | "photography" | "illustration" | "other" | "file" | "folder"
  description: string
  status: "active" | "archived"
  category: "design" | "photography" | "general" // Añadido para Finder
  coverImage?: string
  coverImageThumb?: string
  photos?: Photo[]
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: "stickers" | "prints" | "digital" | "apparel" | "other"
  status: "available" | "sold_out" | "coming_soon"
  stock?: number
  imageIcon?: string
}

export const initialProjectsData: Project[] = [
  {
    id: "el-cuartito",
    name: "El Cuartito (Fotos)",
    type: "photography",
    description:
      "Una serie de fotografías con una estética vintage de los 90s y 2000s, capturando la esencia de un espacio íntimo y lleno de recuerdos.",
    status: "active",
    category: "photography",
    coverImage: "/cuartito/foto1.jpg",
    photos: [
      { id: "ec1", name: "Detalle Cama", url: "/cuartito/IMG_5482-Mejorado-NR-3.jpg" },
      { id: "ec2", name: "Vista General", url: "/cuartito/IMG_5519-Mejorado-NR-2-2.jpg" },
      { id: "ec3", name: "Esquina con TV", url: "/cuartito/IMG_5600-Mejorado-NR-2.jpg" },
      { id: "ec4", name: "Libros y Objetos", url: "/cuartito/IMG_6235-Mejorado-NR-3.jpg" },
      { id: "ec5", name: "Ventana y Luz", url: "/cuartito/IMG_5926-Mejorado-NR-2.jpg" },
      { id: "ec6", name: "Detalle de Escritorio", url: "/cuartito/IMG_5798-Mejorado-NR-2.jpg" },
      { id: "ec7", name: "Rincón de Lectura", url: "/cuartito/IMG_6333-Mejorado-NR-2.jpg" },
      { id: "ec8", name: "Cama Desordenada", url: "/cuartito/IMG_5842-Mejorado-NR-3.jpg" },
      { id: "ec9", name: "Foto 1", url: "/cuartito/foto1.jpg" },
      { id: "ec10", name: "Foto 2", url: "/cuartito/foto2.jpg" },
      { id: "ec11", name: "Foto 3", url: "/cuartito/foto3.jpg" },
      { id: "ec12", name: "Foto 4", url: "/cuartito/foto4.jpg" },
      { id: "ec13", name: "Foto 5", url: "/cuartito/foto5.jpg" },
      { id: "ec14", name: "Foto 6", url: "/cuartito/foto6.jpg" },
      { id: "ec15", name: "Foto 7", url: "/cuartito/foto7.jpg" },
      { id: "ec16", name: "Foto 8", url: "/cuartito/foto8.jpg" },
      { id: "ec17", name: "Foto 9", url: "/cuartito/foto9.jpg" },
      { id: "ec18", name: "Foto 10", url: "/cuartito/foto10.jpg" },
      { id: "ec19", name: "Foto 11", url: "/cuartito/IMG_6292-Mejorado-NR-2.jpg" },
      { id: "ec20", name: "Foto 12", url: "/cuartito/IMG_6316-Mejorado-NR-2.jpg" },
    ],
  },
  {
    id: "flow-0000",
    name: "Flow 0000",
    type: "photography",
    description: "Exploración visual de la fluidez y el movimiento a través de la fotografía abstracta y experimental.",
    status: "active",
    category: "photography",
    coverImage: "/flow0000/IMG_1776.jpg",
    photos: [
      { id: "f01", name: "Flow 1", url: "/flow0000/IMG_1776.jpg" },
      { id: "f02", name: "Flow 2", url: "/flow0000/IMG_2168.jpg" },
      { id: "f03", name: "Flow 3", url: "/flow0000/IMG_2292-2.jpg" },
      { id: "f04", name: "Flow 4", url: "/flow0000/IMG_2357-3.jpg" },
      { id: "f05", name: "Flow 5", url: "/flow0000/IMG_1871-2.jpg" },
      { id: "f06", name: "Flow 6", url: "/flow0000/IMG_1763-4.jpg" },
      { id: "f07", name: "Flow 7", url: "/flow0000/IMG_2191-2.jpg" },
    ],
  },
  {
    id: "otros-disenos",
    name: "KIKU Diseños",
    type: "design",
    description:
      "Una colección variada de diseños gráficos, ilustraciones y branding con el sello distintivo de KIKU Cream.",
    status: "active",
    category: "design",
    coverImage: "/images/design-software.png",
    photos: [
      { id: "kd1", name: "Logo KIKU Rojo", url: "/kiku-loading-bg.png" },
      { id: "kd2", name: "Concepto Abstracto", url: "/placeholder.svg?width=800&height=600&text=Dise%C3%B1o+KIKU+1" },
      { id: "kd3", name: "Windows 2000", url: "/images/windows-2000.png" },
      { id: "kd4", name: "Wallpaper", url: "/wallpaper.png" },
      { id: "kd5", name: "Retro Wallpaper", url: "/retro-wallpaper.png" },
    ],
  },
  {
    id: "documentos",
    name: "Documentos Secretos",
    type: "folder",
    description: "Archivos confidenciales de KIKU Cream. ¡Acceso restringido!",
    status: "active",
    category: "general",
  },
  {
    id: "manifiesto_kiku.txt",
    name: "Manifiesto_KIKU.txt",
    type: "file",
    description: "El manifiesto oficial de KIKU Cream, detallando nuestra filosofía y visión creativa.",
    status: "active",
    category: "general",
  },
  {
    id: "ideas_geniales.doc",
    name: "Ideas_Geniales.doc",
    type: "file",
    description: "Un documento lleno de ideas brillantes para futuros proyectos y expansiones de KIKU.",
    status: "active",
    category: "general",
  },
  {
    id: "mi_arte_digital",
    name: "Mi Arte Digital (Carpeta)",
    type: "folder",
    description: "Una carpeta que contiene diversas obras de arte digital creadas por KIKU.",
    status: "active",
    category: "general",
  },
]

export const initialProductsData: Product[] = [
  {
    id: "prod1",
    name: "Pack Stickers KIKU Clásicos",
    price: 15000,
    description: "10 stickers variados con diseños retro exclusivos. ¡Pégalos donde quieras!",
    category: "stickers",
    status: "available",
    stock: 50,
    imageIcon: "/icons/diseno.png",
  },
  {
    id: "prod2",
    name: "Stickers Personalizados",
    price: 20000,
    description: "Crea tus propios stickers con diseños aesthetic únicos. Ideal para tu laptop o agenda.",
    category: "stickers",
    status: "available",
    stock: 30,
    imageIcon: "/icons/diseno.png",
  },
  {
    id: "prod3",
    name: "Print A3 El Cuartito",
    price: 25000,
    description: "Impresión A3 de alta calidad de una escena icónica de El Cuartito. Arte para tus paredes.",
    category: "prints",
    status: "available",
    stock: 20,
    imageIcon: "/icons/contacto.png",
  },
  {
    id: "prod4",
    name: "Canvas Print Premium",
    price: 45000,
    description: "Impresión en canvas premium de El Cuartito. Calidad de galería para tu hogar.",
    category: "prints",
    status: "available",
    stock: 10,
    imageIcon: "/icons/contacto.png",
  },
  {
    id: "prod5",
    name: "Logo Digital Retro",
    price: 50000,
    description: "Diseño de logo personalizado con estética retro para tu marca o proyecto.",
    category: "digital",
    status: "available",
    stock: 999, // Digital, stock ilimitado
    imageIcon: "/icons/escritorio.png",
  },
  {
    id: "prod6",
    name: "Pack Wallpapers KIKU",
    price: 25000,
    description: "Colección de wallpapers aesthetic de El Cuartito para tu PC y móvil.",
    category: "digital",
    status: "available",
    stock: 999,
    imageIcon: "/icons/escritorio.png",
  },
]
