# Bitácora · PWA — Cemenquin S.A. de C.V.

App de campo para registrar anotaciones y fotos, instalable en iPhone sin App Store.

## Archivos incluidos
```
bitacora/
├── index.html          ← App principal (todo en uno)
├── manifest.json       ← Configuración PWA
├── sw.js               ← Service Worker (modo offline)
├── icon-192.png        ← Ícono para Android / Chrome
├── icon-512.png        ← Ícono grande
└── apple-touch-icon.png← Ícono para iPhone
```

## Cómo instalar en iPhone

### Opción A — Hosting gratuito con GitHub Pages (recomendado)
1. Crear cuenta en github.com
2. Crear repositorio nuevo (ej. `bitacora-cemenquin`)
3. Subir todos los archivos de esta carpeta
4. Ir a Settings → Pages → Source: main branch → Save
5. Tu URL será: `https://TU-USUARIO.github.io/bitacora-cemenquin/`
6. Abrir esa URL en Safari del iPhone
7. Tap en 📤 Compartir → "Agregar a pantalla de inicio"
8. ✅ La app queda instalada como nativa

### Opción B — Netlify (aún más fácil)
1. Ir a netlify.com → Log in con GitHub
2. Arrastrar la carpeta `bitacora/` al área de deploy
3. Obtienes URL tipo `https://random-name.netlify.app`
4. Abrir en Safari → Compartir → Agregar a pantalla de inicio

### Opción C — Red local (solo WiFi de empresa)
1. Instalar Node.js en una computadora de la red
2. Correr: `npx serve bitacora/ -p 8080`
3. En iPhone (misma red): abrir `http://IP-DE-LA-PC:8080`
4. Compartir → Agregar a pantalla de inicio

## Funciones
- ✅ Anotaciones de texto con título
- ✅ Fotos desde cámara o galería (comprimidas automáticamente)
- ✅ Fecha y hora automática
- ✅ Categorías: Entrega, Ruta, Incidente, Mantenimiento, General, Otro
- ✅ Etiquetas personalizadas por entrada
- ✅ Buscar en todas las entradas
- ✅ Filtrar por categoría
- ✅ Editar y eliminar entradas
- ✅ Ver fotos en pantalla completa
- ✅ Exportar a PDF (una entrada o todas)
- ✅ Funciona offline (después de primera carga)
- ✅ Datos guardados localmente en el dispositivo

## Notas
- Los datos se guardan en el dispositivo (IndexedDB), no en ningún servidor
- Para hacer respaldo, exportar PDF periódicamente
- Compatible con iOS 14+ / Chrome Android / Safari
