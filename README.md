# Altura

Altura integra una adaptación en español de [Flown](https://github.com/saschagrunert/flown), con su interfaz, mapa y herramientas de análisis de vuelos. Mantiene las funciones originales: mapa de calor, rutas coloreadas por altitud y velocidad, aeropuertos, filtros, búsqueda, perfiles, reproducción, vista 3D/globo, satélite y resumen anual.

La base de Flown se distribuye bajo Apache 2.0. Se conserva el texto de la licencia y los avisos de copyright; las modificaciones locales se indican en los archivos modificados. Consulta [LICENSE](LICENSE) y [NOTICE](NOTICE).

La carta VFR de España se abre en el visor oficial [Insignia VFR de ENAIRE](https://insigniavfr.enaire.es/). La antigua capa global de OpenFlightMaps se retiró porque no ofrece cobertura de España.

## Desarrollo local

Necesitas Node.js 26 o posterior y Python 3.14 o posterior. Desde la raíz del repositorio:

```sh
npm ci
python -m pip install .
npm run build
python -m flown data --output-dir docs
python -m http.server 8000 --directory docs
```

Abre `http://localhost:8000`. Puedes arrastrar KML/KMZ a la aplicación; se procesan en el navegador y no se suben al servidor. Los archivos de vuelo dentro de `data/` se excluyen de Git por privacidad.

La carpeta [legacy-altura](legacy-altura/) conserva el prototipo anterior de este repositorio como referencia; no forma parte del sitio publicado.

## Publicación

El workflow de [GitHub Pages](.github/workflows/pages.yml) compila y publica el sitio al actualizar `main`. En GitHub, configura **Settings → Pages → Build and deployment → Source: GitHub Actions**. No se incluyen trazas KML/KMZ privadas en el despliegue.
