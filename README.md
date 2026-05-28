# Mosaico de Páginas - Página de Inicio para Navegador

Página de inicio estática inspirada en Opera GX con estética pixel-art y funcionalidades de organización de enlaces.

## Características

### Gestión de Grupos y Páginas
- **Grupos organizados**: Crea grupos personalizados para categorize tus páginas
- **Drag & Drop**: Reordena grupos y páginas arrastrándolos
- **Selector de grupo**: Lista desplegable con grupos existentes + opción de crear nuevo
- **Edición simple**: Renombra o elimina grupos y páginas fácilmente

### Buscador Multi-Motor
- **Google**: Búsqueda estándar
- **ChatGPT**: Busca directamente en ChatGPT
- **DuckDuckGo**: Alternativa privada

### Personalización de Fondo
- **Color de fondo**: Selector de color
- **URL de imagen**: Pegar enlace a imagen
- **Cargar archivo**: Subir imagen desde tu computadora
- **Galería de fondos**: Colección de fondos de Unsplash

### Iconos y Favicons
- **Autocompletado de nombre**: Sugiere automáticamente el nombre de la página desde la URL
- **Iconos predefinidos**: Selecciona iconos de Simple Icons, Iconify o SVGRepo
- **Favicon automático**: Obtiene favicon desde la URL o usa alternativo

### Datos y Privacidad
- **LocalStorage**: Todos los datos se guardan localmente en tu navegador
- **Exportar**: Descarga tus grupos como archivo `.txt`
- **Importar**: Restaura tus datos desde un archivo

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos con tema oscuro (#1a1a1a) y acento verde (#5cdb95)
- **JavaScript**: Vanilla JS, sin frameworks
- **Font Awesome 6.0.0**: Iconos
- **Google Fonts**: Press Start 2P, Orbitron

## Estructura del Proyecto

```
├── index.html          # Punto de entrada
├── styles.css          # Estilos completos
├── script.js           # JavaScript completo
├── img/                # Imágenes y favicon
├── Orbitron/           # Fuente personalizada
└── README.md           # Este archivo
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/mosaico_page.git
   ```

2. Abre `index.html` en tu navegador

O usa un servidor local:
```bash
npx serve .
python -m http.server 8000
```

## Uso

1. **Agregar Página**: Clic en "Agregar Página", selecciona o crea un grupo, ingresa la URL
2. **Editar Fondo**: Clic en "Cambiar Fondo" y elige color, URL, archivo o galería
3. **Modo Edición**: Activa el modo edición para reordernar o eliminar elementos
4. **Exportar/Importar**: Guarda o restaura tus datos desde archivos

## Vista

![Vista principal](https://github.com/user-attachments/assets/c12c5995-af77-4a77-814d-b96625aadea6)

## Licencia

MIT License
