# Altura Next

Prototipo de una nueva aplicación web para visualizar vuelos a partir de archivos KML. Esta carpeta contiene una implementación creada para el proyecto Altura y no importa módulos del frontend anterior.

## Funciones incluidas

- Carga local de uno o varios archivos KML, mediante selector o arrastrar y soltar.
- Detección de vuelo, fecha y aeropuertos desde nombres `FlightAware_...`.
- Resumen de distancia, altitud máxima y velocidad cuando el KML incluye marcas de tiempo.
- Rutas coloreadas por altitud o velocidad, con perfil de elevación 3D.
- Perfil de altitud, reproducción de la ruta y búsqueda con filtro por año.
- Vista satélite, relieve, modo claro y centrado al norte.
- Capa opcional de información aeronáutica VFR oficial de ENAIRE, limitada al espacio aéreo español.
- Conversión de códigos ICAO de aeropuertos españoles y destinos internacionales habituales a IATA.
- Historial guardado en el almacenamiento local del navegador; los KML no se suben.
- Acceso a [Insignia VFR](https://insigniavfr.enaire.es/) y a las [cartas VFR500 oficiales](https://aip.enaire.es/AIP/CartasInsigniaImpresas-es.html) de ENAIRE.

## Vista previa

Desde la raíz del repositorio, ejecuta:

```sh
node altura-next/serve.mjs
```

Después abre `http://127.0.0.1:8000`. Se requieren conexión a Internet para descargar MapLibre, los estilos cartográficos, las imágenes satélite y los mosaicos de elevación.

## Independencia e historial

El frontend nuevo está implementado en esta carpeta y no importa módulos del sitio anterior. Los archivos de la versión anterior se retiraron del árbol de trabajo y siguen disponibles en el historial Git y en la rama de respaldo. Se conservan `LICENSE` y `NOTICE` para documentar esos materiales históricos.

