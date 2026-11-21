# Altura

Una bitácora visual para explorar rutas de vuelo y resumir cada temporada. La aplicación funciona como sitio estático; no hay servicio propio. Las trazas se procesan y guardan localmente en el navegador.

## Uso

Sirve el directorio con cualquier servidor estático, por ejemplo:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000` y añade archivos `.kml` o `.kmz`.

## Funciones actuales

- Mapa interactivo con rutas, puntos de salida/llegada, escala de calor y capas por altitud o velocidad; cambia entre calles e imagen satélite.
- Importación de varios KML y KMZ; entiende `gx:Track` y `LineString`.
- Filtros por temporada y aeronave, búsqueda de vuelos por nombre, aeropuerto o código, y búsqueda de lugares.
- Distancia aproximada, tiempo entre trazas con marcas de tiempo, altitud máxima y resumen anual.
- Detalle por vuelo, perfil de altitud, reproducción animada y reproducción de todos los vuelos.
- Origen y destino por códigos ICAO/IATA presentes en el nombre de archivo, con estimación desde los puntos extremos si no hay códigos.
- Identificación aproximada de aeropuertos y llegadas estimadas a partir de los finales de vuelo.
- Perfiles de sección y medición de distancia.
- Enlaces que guardan la vista y los filtros del mapa, sin incluir las trazas privadas.
- Exportación del mapa como imagen, exportación de trazas a KML y descarga de una tarjeta Wrapped.
- Interfaz adaptable a móvil y escritorio.
- Interfaz oscura adaptable a móvil y escritorio.
- Vistas 3D de relieve y globo con mapa de calles o satélite, mediante MapLibre, y los mismos aeropuertos que en 2D.
- Recorrido guiado por las zonas donde más se concentran las trazas.

## Datos y servicios externos

Las rutas procesadas se guardan en IndexedDB local y permanecen en este navegador hasta que las borres desde la bitácora. El catálogo público de aeropuertos de OurAirports se descarga al navegador cuando importas vuelos y las coordenadas de vuelo se comparan localmente. El origen y destino se reconocen por los códigos o nombres de aeropuerto del archivo; si faltan, se estiman por proximidad a los extremos de la traza. OurAirports declara sus datos de dominio público y advierte que no garantiza su exactitud; por eso la identificación y los recuentos son aproximados. Los mosaicos del mapa de calles se descargan de OpenStreetMap con su atribución visible. La vista satélite 2D y 3D usa el servicio World Imagery de Esri y muestra su atribución. La vista 3D también solicita mosaicos de elevación públicos a AWS. La búsqueda de lugares envía el texto de búsqueda a Photon, que usa datos de OpenStreetMap. Las librerías del mapa, archivos comprimidos y fuentes tipográficas se sirven desde CDN. Ninguno de estos servicios recibe los archivos KML/KMZ.

## En desarrollo

Las vistas 3D y globo ya están disponibles; el relieve representa el terreno y las rutas siguen elevadas por su altitud en el perfil, no como geometría tridimensional sobre el terreno. El origen y destino se extraen de códigos ICAO/IATA reconocidos en el nombre del archivo; si no aparecen, se aproximan con aeropuertos cercanos a los extremos. Las coincidencias son aproximadas y las llegadas estimadas cuentan el final de cada vuelo cercano a un aeródromo; aún faltan los datos detallados de aterrizaje, como tomas y despegues. Las cartas aeronáuticas también están en desarrollo.
