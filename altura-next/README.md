# Altura Next

Prototipo de una nueva aplicación web para visualizar vuelos a partir de archivos KML. Esta carpeta contiene una implementación creada para el proyecto Altura y no importa módulos del frontend anterior.

## Funciones incluidas

- Carga local de uno o varios archivos KML, mediante selector o arrastrar y soltar.
- Detección de vuelo, fecha y aeropuertos desde nombres `FlightAware_...`.
- Resumen de distancia, altitud máxima y velocidad cuando el KML incluye marcas de tiempo.
- Rutas coloreadas por altitud o velocidad, con perfil de elevación 3D.
- Vista satélite, relieve, modo claro y centrado al norte.
- Conversión de códigos ICAO de aeropuertos españoles conocidos a IATA.

## Vista previa

Sirve esta carpeta con cualquier servidor HTTP estático. Por ejemplo, desde la raíz del repositorio:

```sh
python -m http.server 8000 --directory altura-next
```

Después abre `http://localhost:8000`. Se requieren conexión a Internet para descargar MapLibre, los estilos cartográficos, las imágenes satélite y los mosaicos de elevación.

## Estado del reemplazo

Esta carpeta es el primer paso del reemplazo progresivo. El resto del repositorio aún contiene el sitio y el historial previos. Por ese motivo se mantienen los avisos y la licencia Apache que acompañan a ese material; no se deben quitar hasta completar y revisar su retirada.

