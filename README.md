# Diego Espina · Web personal

Frontal de [diegoespinarodriguez.com](https://diegoespinarodriguez.com): porfolio, CV online y actividad en GitHub de Diego Espina Rodríguez, Backend Developer .NET. **React 19**, TypeScript y Vite, servido por Nginx. La API en ASP.NET Core 10 vive en su propio repositorio: [My-personal-Website-Back](https://github.com/diegoesp10/My-personal-Website-Back).

![Portada en modo claro](docs/home.jpg)

## Páginas

Cada sección es una ruta propia, con su título y descripción para buscadores:

| Ruta | Contenido |
| --- | --- |
| `/` | Portada: titular, caso de rendimiento, cifras, proyectos destacados, trayectoria, stack y últimos commits. |
| `/proyectos` | Todos los proyectos con filtro por categoría (`?categoria=` se puede compartir). |
| `/proyectos/:id` | Ficha del proyecto: historia, puntos destacados, tecnologías y enlaces a la web y a los repositorios. |
| `/experiencia` | CV online: perfil, experiencia, competencias y formación. Al imprimir se convierte en un CV de una columna (Guardar como PDF). |
| `/github` | Perfil, lenguajes, commits recientes y repositorios públicos, leídos de GitHub a través de la API. Enlaza cada repositorio con su ficha. |
| `/sobre-mi` | Presentación, forma de trabajar y vida fuera de la pantalla. |
| `/diario`, `/diario/:id` | Entradas del diario. |
| `/contacto` | Correo (con botón para copiar), LinkedIn, GitHub y disponibilidad. |
| `/editor` | Editor local del contenido. Solo funciona con la API en Development desde este equipo. |

## Diseño

- Paleta marfil, tinta y naranja con **modo claro y oscuro** (sigue al sistema y se puede cambiar desde la cabecera). Todos los colores son tokens en `src/styles/tokens.css`.
- Tipografías incluidas en el proyecto (sin servicios externos): DM Sans para el texto, Instrument Serif en cursiva para los acentos y JetBrains Mono para etiquetas y datos técnicos.
- Composiciones propias para los proyectos sin captura (onda de audio, libro contable, documentos…). Al subir una captura desde el editor, sustituye a la composición.
- Accesible: enlace para saltar al contenido, foco gestionado al cambiar de página, `aria-current` en la navegación, contraste AA y movimiento reducido respetado.
- Responsive desde 360 px, sin desplazamiento horizontal.

![Proyectos en modo oscuro](docs/proyectos-oscuro.jpg)

## Desarrollo

Requisitos: Node.js 22.12+. La API debe estar en marcha en el puerto 5080 (`Start-Api.ps1` en el repositorio del backend, carpeta hermana `Mi Web Back`).

```powershell
npm ci
npm run dev
```

Abre <http://127.0.0.1:5173>. Vite redirige `/api`, `/uploads` y `/sitemap.xml` a la API. El editor está en <http://127.0.0.1:5173/editor>.

Vista integrada en un solo proceso (compila, copia `dist/` a `Portfolio.Api/wwwroot` del backend y arranca la API en <http://127.0.0.1:5080>):

```powershell
.\scripts\Start-Portfolio.ps1            # -SkipBuild reutiliza dist/, -BackendPath otra carpeta
```

Otros comandos: `npm run build` (comprobación de tipos y compilación en `dist/`), `npm run typecheck`, `npm run format`.

## Docker

```powershell
.\Start-Docker.ps1
```

Construye la imagen y arranca el contenedor web en <http://127.0.0.1:8080> (`$env:PORTFOLIO_PORT` cambia el puerto). Si el contenedor de la API no está en marcha y el backend está en `..\Mi Web Back`, lo arranca antes con su propio script. `-SkipBuild` reutiliza las imágenes.

| Imagen | Contenedor | Red |
| --- | --- | --- |
| `diego-portfolio-web:local` | `diego-portfolio-web` | `diego-portfolio-net` (externa, compartida con la API) |

Nginx sirve `dist/` con caché inmutable para `/assets/`, `no-cache` para el HTML, compresión gzip y cabeceras de seguridad (CSP, `X-Frame-Options`, `Permissions-Policy`…) definidas en `nginx-security-headers.inc`. Reenvía `/api/`, `/uploads/` y `/sitemap.xml` al contenedor `api`, resolviéndolo en cada petición: el contenedor web arranca aunque la API aún no esté lista. Se ejecuta sin root, con sistema de archivos de solo lectura y sin capacidades.

```powershell
docker compose ps
docker compose logs --tail 100
docker compose down
```

## Estructura

```text
src/
├── App.tsx                 Router: una ruta por página
├── main.tsx                Fuentes y estilos
├── components/             Cabecera, pie, tarjetas, composiciones visuales, bloques comunes
├── pages/                  Una página por ruta
├── editor/                 Editor local (carga bajo demanda)
├── data/                   Contexto del contenido y consulta de GitHub
├── lib/                    Tipos del contrato de la API, utilidades de formato y enlaces seguros
└── styles/                 tokens, base, layout, componentes, páginas, editor e impresión
public/                     favicon, robots.txt y theme-init.js (tema antes del primer pintado)
scripts/                    Vista integrada local
Dockerfile · nginx.conf · compose.yaml · Start-Docker.ps1
```

`src/lib/types.ts` refleja el contrato JSON de la API; si cambia el modelo del backend hay que actualizarlo. Las rutas públicas también figuran en el sitemap que genera la API. Las convenciones del repositorio están en [AGENTS.md](AGENTS.md).
