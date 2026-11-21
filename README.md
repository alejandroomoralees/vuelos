# Altura

Altura es una aplicación web para explorar rutas de vuelo desde archivos KML. La implementación nueva está en [`altura-next/`](altura-next/) y se está desarrollando de forma independiente para este proyecto.

## Funciones

- Procesa los KML en el navegador y conserva el historial en el almacenamiento local.
- Lee vuelo, fecha y aeropuertos desde el nombre de archivo de FlightAware; convierte los aeropuertos españoles y varios destinos internacionales habituales a IATA.
- Calcula distancia, altitud y velocidad cuando los datos del KML lo permiten.
- Muestra las rutas en mapa satélite 3D, con relieve, perfil de altitud y reproducción.
- Permite buscar vuelos, filtrar por año, ver el resumen anual y cambiar a mapa claro.
- Enlaza con la cartografía VFR oficial de [ENAIRE Insignia VFR](https://insigniavfr.enaire.es/).

## Ejecutar localmente

Se requiere Node.js. Desde la raíz del repositorio:

```sh
node altura-next/serve.mjs
```

Abre `http://127.0.0.1:8000`. El mapa usa servicios externos de estilos, satélite y elevación; los archivos KML no se envían a esos servicios.

## Publicación

El workflow de GitHub Pages publica los archivos estáticos de `altura-next/` cuando se actualiza `main`.

## Licencias e historial

El sitio anterior y otros materiales de esta rama todavía incluyen código distribuido bajo Apache 2.0. Se conservan `LICENSE`, `NOTICE` y los avisos aplicables mientras ese material permanezca en el repositorio o su historial. La nueva implementación de `altura-next/` no importa módulos del frontend anterior. Los commits históricos siguen reflejando sus autores originales.

