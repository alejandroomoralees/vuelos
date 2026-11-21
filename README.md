# Altura

Tu año en el aire: una experiencia privada para explorar tus vuelos KML, sus rutas y las estadísticas de cada temporada.

## Uso

Abre `index.html` en un navegador moderno y selecciona uno o varios archivos `.kml` exportados desde tu aplicación de vuelo. Los datos se leen y procesan dentro del navegador; no se envían a ningún servidor. Los archivos KMZ todavía no están admitidos.

## Qué incluye esta versión

- Importación local de varios archivos KML con arrastrar y soltar.
- Lectura de trazas `gx:Track` y `LineString`.
- Distancia aproximada, duración cuando hay marcas de tiempo, altitud máxima y filtro por año.
- Dibujo de rutas sobre un mapa vectorial esquemático, sin cargar tiles ni servicios de mapas.
- Diseño adaptable a escritorio y móvil.

## Desarrollo

No necesita instalación ni paso de compilación. Sirve el directorio con cualquier servidor estático, por ejemplo:

```sh
python -m http.server 8000
```

Y abre `http://localhost:8000`.
