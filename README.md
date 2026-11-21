# Altura

Una bitácora visual para explorar rutas de vuelo y resumir cada temporada. La aplicación funciona como sitio estático; no hay servicio propio y los archivos se procesan en memoria dentro del navegador.

## Uso

Sirve el directorio con cualquier servidor estático, por ejemplo:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000` y añade archivos `.kml` o `.kmz`.

## Funciones actuales

- Mapa interactivo con rutas, puntos de salida/llegada, escala de calor y capas por altitud o velocidad.
- Importación de varios KML y KMZ; entiende `gx:Track` y `LineString`.
- Filtros por temporada y aeronave, búsqueda de vuelos y búsqueda de lugares.
- Distancia aproximada, tiempo entre trazas con marcas de tiempo, altitud máxima y resumen anual.
- Detalle por vuelo, perfil de altitud, reproducción animada y reproducción de todos los vuelos.
- Lista de aeropuertos inferidos por los extremos de las trazas, perfiles de sección y medición de distancia.
- Enlaces que guardan la vista y los filtros del mapa, sin incluir las trazas privadas.
- Exportación del mapa como imagen, exportación de trazas a KML y descarga de una tarjeta Wrapped.
- Interfaz adaptable a móvil y escritorio.

## Datos y servicios externos

Las rutas y estadísticas viven solo en la memoria de la pestaña y desaparecen al cerrarla. Los mosaicos de mapa se descargan de OpenStreetMap con su atribución visible. La búsqueda de lugares envía el texto de búsqueda a Photon, que usa datos de OpenStreetMap. Las librerías del mapa y de archivos comprimidos se sirven desde CDN. Ninguno de estos servicios recibe los archivos KML/KMZ.

## En desarrollo

El relieve 3D/globo, las cartas aeronáuticas, la base de datos de aeropuertos con códigos ICAO, los datos de aterrizajes y la visita guiada por puntos calientes aún no están implementados. La lista de aeropuertos de esta versión agrupa aproximando los extremos de las rutas.
