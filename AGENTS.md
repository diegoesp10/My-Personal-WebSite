# Convenciones del frontend

- Este repositorio contiene solo el frontal. La API vive en el repositorio My-personal-Website-Back (carpeta hermana `Mi Web Back`). React se compila en `dist/`; no escribir en el backend desde Vite. La copia a `Portfolio.Api/wwwroot` del backend se reserva para `scripts/Copy-FrontendBuild.ps1`, usado por la vista local integrada.
- Una página por ruta en `src/pages`, registrada en `src/App.tsx`. Si se añade o cambia una ruta pública, actualizar también `SitemapService` en el backend y la navegación (`components/Header.tsx`).
- `src/lib/types.ts` refleja el contrato JSON de la API. No inventar campos: cualquier cambio de modelo empieza en el backend y debe ser aditivo.
- Todo el contenido visible sale de la API (editable en `/editor`); en los componentes solo va el texto de interfaz. No publicar datos que no estén en el contenido.
- Los enlaces externos pasan por `safeUrl` y las imágenes por `imageUrl`. No usar HTML sin escapar.
- Colores y tipografías solo mediante los tokens de `src/styles/tokens.css`, con sus valores para modo claro y oscuro. Las fuentes se sirven desde el propio proyecto.
- Mantener la accesibilidad: foco visible, textos alternativos, `aria-*` en controles y respeto a `prefers-reduced-motion`. Comprobar a 360 px de ancho sin desplazamiento horizontal.
- La CSP de `nginx-security-headers.inc` no permite scripts en línea ni recursos de terceros salvo los avatares de GitHub. Si se añade uno, actualizar la CSP aquí y en `SecurityHeadersMiddleware` del backend.
- Antes de entregar: `npm run build` sin errores y reconstruir el contenedor (`Start-Docker.ps1`).
