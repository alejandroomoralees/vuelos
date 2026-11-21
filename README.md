# Altura

Altura muestra y analiza rutas de vuelo a partir de archivos KML de FlightAware. La aplicación activa es [`altura-next/`](altura-next/), una implementación independiente escrita para este proyecto.

## Funciones

- Lee KML localmente y conserva el historial en el almacenamiento de este navegador.
- Extrae vuelo, fecha y aeropuertos del nombre FlightAware; convierte a IATA aeropuertos españoles y destinos internacionales habituales.
- Calcula distancia, altitud y velocidad según los datos disponibles en cada archivo.
- Dibuja las rutas en mapa satélite 3D con relieve, reproducción y perfil de altitud.
- Incluye búsqueda, filtro anual, resumen de vuelos por año y modo claro.
- Enlaza con [ENAIRE Insignia VFR](https://insigniavfr.enaire.es/) y las [cartas VFR500 oficiales](https://aip.enaire.es/AIP/CartasInsigniaImpresas-es.html).

## Ejecutar localmente

Se requiere Node.js. Desde la raíz del repositorio:

```sh
node altura-next/serve.mjs
```

Abre `http://127.0.0.1:8000`. El mapa descarga estilos, imágenes y elevación de sus proveedores; los KML no se envían a esos servicios.

## Publicación

GitHub Pages publica los archivos estáticos de `altura-next/` al actualizar `main`, mediante [pages.yml](.github/workflows/pages.yml).

## Licencias e historial

El árbol de trabajo actual contiene la implementación independiente de Altura. El historial de esta rama y las ramas de respaldo conservan versiones anteriores que incluían materiales derivados de Flown. Se mantienen `LICENSE` y `NOTICE` para preservar los avisos asociados a esas revisiones; el historial identifica los commits y sus autores originales.

