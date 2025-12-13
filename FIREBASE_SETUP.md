# 🔥 Configuración de Firebase Storage para KIKU

## ✅ Estado Actual

Tu proyecto ya está **100% preparado** para usar Firebase Storage con archivos. Todo el código necesario ya está implementado:

### ✓ Lo que ya tienes funcionando:
- ✅ Firebase Storage inicializado en `lib/firebase.ts`
- ✅ Funciones de utilidad para subir/eliminar archivos en `lib/storage-utils.ts`
- ✅ Admin Panel con soporte para subir archivos (no URLs)
- ✅ Sistema de contexto para manejar proyectos y productos
- ✅ Firestore configurado para almacenar metadata

---

## 💰 Información de Pago de Firebase

### Plan Actual: **Spark (Gratis)**
Tu proyecto usa el plan gratuito que incluye:
- ✅ 5 GB de Storage
- ✅ 1 GB/día de transferencia
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día

### ⚠️ ¿Cuándo necesitas pagar?

**NO necesitas pagar** si:
- Tienes menos de 5 GB de imágenes
- Recibes menos de 50,000 visitas/día
- No necesitas funciones avanzadas

**SÍ necesitas pagar** (Plan Blaze - Pay as you go) si:
- Superas los límites gratuitos
- Necesitas más de 5 GB de almacenamiento
- Quieres usar Cloud Functions avanzadas

### Costos del Plan Blaze:
- **Storage**: $0.026 por GB/mes (después de 5 GB gratis)
- **Descarga**: $0.12 por GB (después de 1 GB gratis/día)
- **Ejemplo**: 10 GB de fotos + 5 GB descarga/mes = ~$0.73/mes

**Para portfolios pequeños/medianos: El plan gratis es suficiente**

---

## 🔐 Configuración de Seguridad (MUY IMPORTANTE)

### Paso 1: Configurar Reglas de Storage

Ve a Firebase Console → Storage → Rules y pega esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de todos los archivos
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Solo admin puede escribir
    match /projects/{category}/{projectId}/{fileName} {
      allow write: if request.auth != null;
    }
    
    match /products/{productId}/{fileName} {
      allow write: if request.auth != null;
    }
    
    match /temp/{fileName} {
      allow write: if request.auth != null;
    }
  }
}
```

### Paso 2: Configurar Reglas de Firestore

Ve a Firebase Console → Firestore → Rules y pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Proyectos - lectura pública, escritura autenticada
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Productos - lectura pública, escritura autenticada
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🔑 Autenticación para Admin

### Opción 1: Email/Password (Recomendado para ti)

1. Ve a Firebase Console → Authentication → Sign-in method
2. Habilita "Email/Password"
3. Ve a "Users" → "Add user"
4. Crea tu usuario admin:
   - Email: `tu-email@gmail.com`
   - Password: `tu-password-seguro`

### Opción 2: Reglas temporales (Solo desarrollo)

Si quieres probar SIN autenticación (temporal):

```javascript
// SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // ⚠️ PELIGROSO - Solo para testing
    }
  }
}
```

---

## 📝 Cómo Usar el Admin Panel

### 1. Crear un Proyecto con Archivos

1. Ve a `/admin` en tu navegador
2. Click en "Nuevo Proyecto"
3. Completa:
   - **Nombre**: Ej: "Sesión Primavera 2024"
   - **Categoría**: photography / design / video
4. **Subir Cover Image**: Click en "Elegir archivo" → Selecciona 1 imagen
5. **Subir Fotos**: Click en "Elegir archivos" → Selecciona múltiples imágenes
6. Click "Guardar Proyecto"

### 2. Lo que pasa internamente:

```
Usuario selecciona archivos
    ↓
Admin Panel sube a Firebase Storage
    ↓
Genera URLs automáticas
    ↓
Guarda URLs en Firestore
    ↓
Tu sitio muestra las imágenes
```

---

## 🎯 Estructura de Archivos en Storage

```
kiku-a30c5.firebasestorage.app/
├── projects/
│   ├── photography/
│   │   ├── sesion-playa-1699999999/
│   │   │   ├── cover-imagen.jpg
│   │   │   ├── 1699999999-0-foto1.jpg
│   │   │   ├── 1699999999-1-foto2.jpg
│   │   │   └── ...
│   ├── design/
│   │   ├── identidad-marca-1699999999/
│   │   │   └── ...
│   └── video/
│       └── ...
└── products/
    ├── print-001.jpg
    └── ...
```

---

## 🚀 Checklist de Implementación

### Antes de usar en producción:

- [ ] Configurar reglas de Storage (ver arriba)
- [ ] Configurar reglas de Firestore (ver arriba)
- [ ] Crear usuario admin en Authentication
- [ ] Implementar login en `/admin`
- [ ] Probar subir 1 imagen de prueba
- [ ] Verificar que se vea en el sitio
- [ ] Borrar imagen de prueba
- [ ] **OPCIONAL**: Actualizar a plan Blaze si necesitas más de 5 GB

### Archivos ya listos en tu proyecto:

- ✅ `lib/firebase.ts` - Configuración de Firebase
- ✅ `lib/storage-utils.ts` - Funciones para subir/borrar archivos
- ✅ `components/admin-panel.tsx` - Panel con upload de archivos
- ✅ `context/data-context.tsx` - Gestión de datos
- ✅ Firebase config con Storage Bucket: `kiku-a30c5.firebasestorage.app`

---

## 🛠️ Próximos Pasos

### 1. Lo que YO ya hice por ti:
- ✅ Configuré Firebase Storage en el código
- ✅ Creé funciones para subir múltiples archivos
- ✅ Integré el upload en el Admin Panel
- ✅ Generé rutas automáticas organizadas por categoría
- ✅ Sistema de preview de imágenes
- ✅ Manejo de errores y notificaciones

### 2. Lo que TÚ necesitas hacer:

#### A. En Firebase Console (5 minutos):
1. Ir a https://console.firebase.google.com/
2. Seleccionar proyecto "kiku-a30c5"
3. Storage → Rules → Pegar reglas de seguridad (ver arriba)
4. Firestore → Rules → Pegar reglas (ver arriba)
5. Authentication → Habilitar Email/Password → Crear tu usuario

#### B. En tu código (OPCIONAL - solo si quieres login):
1. Crear página de login en `/admin/login`
2. Proteger la ruta `/admin`
3. Usar Firebase Auth para validar usuario

---

## 📊 Monitoreo de Uso

Ve a Firebase Console para ver:
- **Storage**: Cuánto espacio usas (de 5 GB gratis)
- **Firestore**: Lecturas/escrituras por día
- **Costos**: Si estás cerca del límite

---

## 🆘 Troubleshooting

### "Permission denied" al subir archivos
→ Verifica las reglas de Storage (debe permitir write con autenticación)

### "auth is null"
→ Necesitas implementar login o usar reglas temporales de desarrollo

### Las imágenes no se ven
→ Verifica que las reglas permitan `read: if true`

### Error de CORS
→ Firebase Storage ya tiene CORS configurado, pero verifica en Console

---

## 💡 Tips de Optimización

1. **Redimensiona imágenes antes de subirlas** (idealmente max 2000px)
2. **Usa formatos WebP** para mejor compresión
3. **Implementa lazy loading** (ya lo tienes con Next/Image)
4. **Usa el componente Image de Next.js** (ya lo estás usando ✅)

---

## 📞 Información que necesitas darme

Para ayudarte con login/autenticación, necesitaría:
1. ¿Quieres implementar login o usar reglas abiertas temporalmente?
2. ¿Planeas tener múltiples admins o solo tú?
3. ¿Prefieres Email/Password o Google Sign-In?

**Por ahora puedes usar reglas abiertas en desarrollo (allow write: if true) para testear.**

---

¡Todo está listo! Solo configura las reglas en Firebase Console y empieza a subir archivos desde `/admin` 🚀
