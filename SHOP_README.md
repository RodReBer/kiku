# 🛍️ KIKU CREAM SHOP - Documentación

## Estructura del Sistema

### 1. Contexto de Datos (`context/data-context.tsx`)

**Interface Product:**
```typescript
interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
  status: "available" | "sold_out" | "coming_soon"
  stock?: number
  createdAt?: Date
  updatedAt?: Date
}
```

**Productos Mock:**
Se agregaron 6 productos de ejemplo que se muestran actualmente en el shop:
- Camiseta KIKU Limited ($45)
- Poster Chrysanthemum ($30)
- Sticker Pack ($15)
- Tote Bag KIKU ($25)
- Photobook Collection ($60)
- Gorra KIKU ($35)

Todos los productos mock tienen `status: "coming_soon"` y `stock: 0`.

### 2. Componente de Grilla (`components/shop-grid.tsx`)

**Funcionalidades:**
- Vista en grilla responsiva (2 columnas mobile, 3 desktop)
- Cards de productos con imagen, nombre, precio, categoría
- Badges de estado (Disponible/Agotado/Próximamente)
- Modal de detalle al hacer click en un producto
- Botón de "Agregar al Carrito" (deshabilitado para productos no disponibles)

**Diseño:**
- Estilo retro Windows 95
- Bordes con efecto "outset"
- Colores: fondo `#c0c0c0`, header `#000080`
- Responsive con Tailwind CSS

### 3. Integración en Desktop (`components/mac-desktop.tsx`)

**handleShopClick:**
```typescript
const shopContent = <ShopGrid products={products} />
openCenteredWindow("Shop - KIKU", shopContent, {
  width: isMobile ? Math.min(350, window.innerWidth * 0.95) : 900,
  height: isMobile ? Math.min(500, window.innerHeight * 0.85) : 700,
})
```

### 4. Panel de Administración (`components/admin-panel.tsx`)

**Estado Actual:**
- ✅ Tab "Productos" visible en el admin
- ✅ Interfaz completa de gestión de productos
- ⏳ **DESHABILITADO** hasta completar pago
- ✅ Visualización de productos mock
- ❌ Botones de edición/eliminación deshabilitados
- ❌ Formulario de nuevo producto deshabilitado

**Funcionalidades Preparadas (deshabilitadas):**
- Agregar nuevo producto
- Editar producto existente
- Eliminar producto
- Cambiar estado (disponible/agotado/próximamente)
- Gestión de stock
- Subida de imágenes (cuando se habilite)

## Firebase Structure

### Colección: `products`

```json
{
  "id": "auto-generated",
  "name": "Nombre del Producto",
  "price": 45,
  "image": "url-de-imagen",
  "description": "Descripción del producto",
  "category": "Ropa",
  "status": "available" | "sold_out" | "coming_soon",
  "stock": 10,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Flujo de Trabajo Futuro

### Cuando se habilite (post-pago):

1. **En `admin-panel.tsx`:**
   - Quitar clases `opacity-50 pointer-events-none`
   - Quitar atributo `disabled` de todos los botones
   - Habilitar `showNewProduct` state
   - Conectar handlers:
     - `handleAddProduct()`
     - `handleEditProduct(id, updates)`
     - `handleDeleteProduct(id)`

2. **Subida de Imágenes:**
   - Usar `uploadImage()` de `lib/storage-utils.ts`
   - Ruta: `products/{category}/{product-name}-{timestamp}/`
   - Generar thumbnails con `generateThumbnails()`

3. **Actualización de Mocks:**
   - Eliminar array `MOCK_PRODUCTS` de `data-context.tsx`
   - Los productos vendrán directamente de Firebase

## Categorías Sugeridas

- 🎽 Ropa (camisetas, gorras, hoodies)
- 🎨 Arte (posters, prints, stickers)
- 📚 Libros (photobooks, zines)
- 🎒 Accesorios (tote bags, pins, patches)
- 💿 Digital (wallpapers, presets, templates)

## Notas Importantes

- ⚠️ Los productos mock usan las mismas imágenes que el desktop de KIKU (temporal)
- ⚠️ Cuando se suba un producto real, se debe proporcionar una imagen específica
- ⚠️ El carrito de compras NO está implementado (requiere Stripe/PayPal)
- ⚠️ El sistema de checkout NO está implementado
- ✅ La estructura de datos está lista para cuando se habilite

## Testing

Para probar el shop:
1. Click en "Shop" desde el menú principal o icono
2. Se abrirá ventana con grilla de productos mock
3. Click en cualquier producto para ver detalle
4. Todos los productos muestran "PRÓXIMAMENTE"

Para probar el admin (deshabilitado):
1. Login: `admin` / `kiku`
2. Click en tab "Productos"
3. Ver productos mock (botones deshabilitados)
4. Ver banner amarillo indicando que está en desarrollo
