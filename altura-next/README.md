# Altura Next

Prototipo de una nueva aplicación web para visualizar vuelos a partir de archivos KML. Esta carpeta contiene una implementación creada para el proyecto Altura y no importa módulos del frontend anterior.

## Funciones incluidas

- Carga local de uno o varios archivos KML, mediante selector o arrastrar y soltar.
- Detección de vuelo, fecha y aeropuertos desde nombres `FlightAware_...`.
- Resumen de distancia, altitud máxima y velocidad cuando el KML incluye marcas de tiempo.
- Rutas coloreadas por altitud o velocidad, con perfil de elevación 3D.
- Perfil de altitud, reproducción de la ruta y búsqueda con filtro por año.
- Vista satélite, relieve, modo claro y centrado al norte.
- Conversión de códigos ICAO de aeropuertos españoles conocidos a IATA.
- Historial guardado en el almacenamiento local del navegador; los KML no se suben.
- Acceso a [Insignia VFR](https://insigniavfr.enaire.es/) y a las [cartas VFR500 oficiales](https://aip.enaire.es/AIP/CartasInsigniaImpresas-es.html) de ENAIRE.

## Vista previa

Desde la raíz del repositorio, ejecuta:

```sh
node altura-next/serve.mjs
```

Después abre `http://127.0.0.1:8000`. Se requieren conexión a Internet para descargar MapLibre, los estilos cartográficos, las imágenes satélite y los mosaicos de elevación.

## Estado del reemplazo

Esta carpeta es el primer paso del reemplazo progresivo. El resto del repositorio aún contiene el sitio y el historial previos. Por ese motivo se mantienen los avisos y la licencia Apache que acompañan a ese material; no se deben quitar hasta completar y revisar su retirada.

