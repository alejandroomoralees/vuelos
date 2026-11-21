import * as maplibregl from "https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs";

const host = document.querySelector("#map3d");
const modeButton = document.querySelector("#map-mode-button");
const leafMap = window.alturaGetMap?.();
let map3d = null;
let mode = "2d";
let mapStyle = new URLSearchParams(location.search).get("basemap") === "satellite" ? "satellite" : "streets";
let routeData = { type: "FeatureCollection", features: [] };
let heatData = { type: "FeatureCollection", features: [] };
let airportData = { type: "FeatureCollection", features: [] };

const osmStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
      maxzoom: 19
    },
    satellite: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: 'Tiles © <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>',
      maxzoom: 19
    }
  },
  layers: [
    { id: "osm-base", type: "raster", source: "osm", layout: { visibility: "visible" }, paint: { "raster-opacity": 1 } },
    { id: "satellite-base", type: "raster", source: "satellite", layout: { visibility: "none" }, paint: { "raster-opacity": 1 } }
  ]
};

function getData() {
  const flights = window.alturaGetFlights?.() || [];
  const layer = window.alturaGetLayer?.() || 'altitude';
  const pointFeatures = [];
  const routeFeatures = [];
  for (const flight of flights.filter(item => item.points.length > 1)) {
    const step = Math.max(1, Math.ceil(flight.points.length / 1800));
    const points = flight.points.filter((_, index) => index % step === 0 || index === flight.points.length - 1);
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1], to = points[index];
      const altitudes = [from.altitude, to.altitude].filter(Number.isFinite);
      const speeds = [from, to].filter(point => Number.isFinite(point.time) && Number.isFinite(point.speed)).map(point => point.speed);
      const altitude = altitudes.length ? altitudes.reduce((sum, value) => sum + value, 0) / altitudes.length : null;
      const speed = speeds.length ? speeds.reduce((sum, value) => sum + value, 0) / speeds.length : null;
      const value = layer === 'speed' ? speed : altitude;
      const color = layer === 'speed' && speed === null ? '#607382' : colorFor(value ?? 0, layer);
      routeFeatures.push({
        type: 'Feature',
        properties: { id: flight.id, name: flight.name, color, altitude, speed, hasSpeed: speed !== null },
        geometry: { type: 'LineString', coordinates: [[from.lon, from.lat, from.altitude || 0], [to.lon, to.lat, to.altitude || 0]] }
      });
    }
    for (let index = 0; index < flight.points.length; index += Math.max(1, step * 3)) {
      const point = flight.points[index];
      pointFeatures.push({ type: 'Feature', properties: { weight: Math.min(1, .15 + (point.speed || 0) / 200) }, geometry: { type: 'Point', coordinates: [point.lon, point.lat] } });
    }
  }
  const airportGroups = window.alturaGetAirportGroups?.() || [];
  routeData = { type: 'FeatureCollection', features: routeFeatures };
  heatData = { type: 'FeatureCollection', features: pointFeatures };
  airportData = { type: 'FeatureCollection', features: airportGroups.map(airport => ({ type: 'Feature', properties: { count: airport.count, arrivals: airport.arrivals, code: airport.code || '', name: airport.name || 'Aeródromo sin identificar' }, geometry: { type: 'Point', coordinates: [airport.lon, airport.lat] } })) };
  return { routeData, heatData, airportData, layer };
}
function distanceKm(a, b) {
  const rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const n = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
}

function colorFor(value, layer) {
  const stops = layer === "speed" ? ["#4264b2", "#3d96a6", "#91bb79", "#f0cb55"] : ["#5046b5", "#a84f9a", "#e36e55", "#f0cd5a"];
  const t = Math.max(0, Math.min(1, value / (layer === "speed" ? 180 : 3500))) * (stops.length - 1);
  const index = Math.floor(t), fraction = t - index;
  const a = stops[index].match(/\w\w/g).map(part => parseInt(part, 16));
  const b = stops[Math.min(stops.length - 1, index + 1)].match(/\w\w/g).map(part => parseInt(part, 16));
  return `#${a.map((part, i) => Math.round(part + (b[i] - part) * fraction).toString(16).padStart(2, "0")).join("")}`;
}

function createMap() {
  if (map3d || !window.maplibregl && !maplibregl) return;
  map3d = new maplibregl.Map({
    container: host,
    style: osmStyle,
    center: [1.8, 41.5],
    zoom: 5,
    pitch: 0,
    attributionControl: true,
    maxPitch: 70,
    canvasContextAttributes: { antialias: true }
  });
  map3d.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map3d.on("load", () => {
    map3d.addSource("flight-lines", { type: "geojson", data: routeData, lineMetrics: true });
    map3d.addSource("flight-heat", { type: "geojson", data: heatData });
    map3d.addSource("flight-airports", { type: "geojson", data: airportData });
    map3d.addSource("terrain-dem", {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 15,
      encoding: "terrarium"
    });
    map3d.addLayer({
      id: "flight-lines-layer", type: "line", source: "flight-lines",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["get", "color"], "line-width": 3, "line-opacity": .86 }
    });
    map3d.addLayer({
      id: "flight-heat-layer", type: "heatmap", source: "flight-heat", maxzoom: 12,
      paint: { "heatmap-weight": ["get", "weight"], "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, .7, 9, 2.8], "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 3, 9, 20], "heatmap-opacity": .72 }
    });
    map3d.addLayer({
      id: "flight-airports-layer", type: "circle", source: "flight-airports",
      paint: { "circle-radius": ["interpolate", ["linear"], ["get", "count"], 1, 4, 12, 9], "circle-color": "#172f3c", "circle-stroke-color": "#fff5e9", "circle-stroke-width": 2, "circle-opacity": .9 }
    });
    const routePopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: "route-metric-popup" });
    const updateRoutePopup = event => {
      const properties = event.features?.[0]?.properties;
      if (!properties) return;
      routePopup.setLngLat(event.lngLat).setHTML(window.alturaSegmentTooltip?.(properties) || properties.name || "Ruta").addTo(map3d);
    };
    map3d.on("mouseenter", "flight-lines-layer", event => { map3d.getCanvas().style.cursor = "pointer"; updateRoutePopup(event); });
    map3d.on("mousemove", "flight-lines-layer", updateRoutePopup);
    map3d.on("mouseleave", "flight-lines-layer", () => { map3d.getCanvas().style.cursor = ""; routePopup.remove(); });
    map3d.on("click", "flight-lines-layer", event => {
      const id = event.features?.[0]?.properties?.id;
      if (id) window.alturaOpenFlight?.(id);
    });
    map3d.on("click", "flight-airports-layer", event => {
      const feature = event.features?.[0];
      if (!feature) return;
      const properties = feature.properties || {};
      new maplibregl.Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(feature.geometry.coordinates.slice(0, 2))
        .setText(`${properties.name || "Aeródromo"}${properties.code ? ` · ${properties.code}` : ""}\n${properties.arrivals || 0} llegadas estimadas · ${properties.count || 0} visitas`)
        .addTo(map3d);
    });
    map3d.on("mouseenter", "flight-airports-layer", () => { map3d.getCanvas().style.cursor = "pointer"; });
    map3d.on("mouseleave", "flight-airports-layer", () => { map3d.getCanvas().style.cursor = ""; });
    refreshMapData();
    applyMapStyle();
    applyMode();
  });
  map3d.on("error", event => {
    const message = event.error?.message || "No se pudo cargar una capa del mapa.";
    if (/terrain|dem|elevation/i.test(message)) console.info("El mapa continúa sin relieve 3D:", message);
  });
}

function refreshMapData() {
  if (!map3d?.isStyleLoaded()) return;
  const data = getData();
  map3d.getSource("flight-lines")?.setData(data.routeData);
  map3d.getSource("flight-heat")?.setData(data.heatData);
  map3d.getSource("flight-airports")?.setData(data.airportData);
  map3d.setLayoutProperty("flight-lines-layer", "visibility", data.layer === "heat" ? "none" : "visible");
  map3d.setLayoutProperty("flight-heat-layer", "visibility", data.layer === "heat" ? "visible" : "none");
  map3d.setLayoutProperty("flight-airports-layer", "visibility", window.alturaGetAirportsVisible?.() ? "visible" : "none");
}

function applyMapStyle() {
  const satellite = mapStyle === "satellite";
  if (map3d?.isStyleLoaded()) {
    map3d.setLayoutProperty("osm-base", "visibility", satellite ? "none" : "visible");
    map3d.setLayoutProperty("satellite-base", "visibility", satellite ? "visible" : "none");
  }
  const layers = window.alturaMapLayers;
  const leafMap = window.alturaGetMap?.();
  if (layers && leafMap) {
    const active = satellite ? layers.satellite : layers.streets;
    const inactive = satellite ? layers.streets : layers.satellite;
    if (leafMap.hasLayer(inactive)) leafMap.removeLayer(inactive);
    if (!leafMap.hasLayer(active)) active.addTo(leafMap);
    document.querySelector("#map")?.classList.toggle("map-streets-dark", !satellite);
  }
  const button = document.querySelector("#map-style-button");
  if (button) {
    (button.querySelector(".control-label") || button.querySelector("span")).textContent = satellite ? "Satélite" : "Mapa";
    button.title = satellite ? "Cambiar a mapa de calles" : "Cambiar a imagen satélite";
  }
}
window.alturaSetMapStyle = style => { mapStyle = style === "satellite" ? "satellite" : "streets"; applyMapStyle(); };
window.alturaGetMapStyle = () => mapStyle;
window.alturaSetMapStyle(mapStyle);

function setMode(next) {
  mode = next;
  if (mode === "2d") {
    host.classList.remove("is-active");
    if (map3d) {
      const center = map3d.getCenter();
      window.alturaGetMap?.()?.setView([center.lat, center.lng], map3d.getZoom(), { animate: false });
    }
    window.alturaGetMap?.()?.invalidateSize();
    (modeButton.querySelector(".control-value") || modeButton.querySelector("span")).textContent = "2D";
    modeButton.title = "Cambiar a relieve 3D";
    return;
  }
  createMap();
  host.classList.add("is-active");
  if (!map3d) return;
  const current = window.alturaGetMap?.()?.getCenter();
  const zoom = window.alturaGetMap?.()?.getZoom() ?? 5;
  if (current) map3d.jumpTo({ center: [current.lng, current.lat], zoom, pitch: 0 });
  map3d.resize();
  applyMode();
  refreshMapData();
  if (mode === "3d") {
    (modeButton.querySelector(".control-value") || modeButton.querySelector("span")).textContent = "3D";
    modeButton.title = "Cambiar a vista de globo";
  } else {
    (modeButton.querySelector(".control-value") || modeButton.querySelector("span")).textContent = "Globo";
    modeButton.title = "Volver al mapa 2D";
  }
}
window.alturaSetMapMode = setMode;
window.alturaMapMode = () => mode;

function applyMode() {
  if (!map3d?.isStyleLoaded()) return;
  if (mode === "3d") {
    map3d.setProjection({ type: "mercator" });
    map3d.setTerrain({ source: "terrain-dem", exaggeration: 1.25 });
    map3d.easeTo({ pitch: 58, duration: 650 });
  } else if (mode === "globe") {
    map3d.setTerrain(null);
    map3d.setProjection({ type: "globe" });
    map3d.easeTo({ pitch: 0, zoom: Math.min(3, map3d.getZoom()), duration: 650 });
  } else {
    map3d.setTerrain(null);
    map3d.setProjection({ type: "mercator" });
    map3d.easeTo({ pitch: 0, duration: 350 });
  }
}

modeButton.addEventListener("click", () => {
  const next = mode === "2d" ? "3d" : mode === "3d" ? "globe" : "2d";
  setMode(next);
});

for (const selector of ["#year-filter", "#side-year", "#aircraft-filter", "#airports-toggle"]) {
  document.querySelector(selector).addEventListener("change", () => setTimeout(refreshMapData, 20));
}
document.querySelectorAll('input[name="layer"]').forEach(input => input.addEventListener("change", () => setTimeout(refreshMapData, 20)));
new MutationObserver(() => refreshMapData()).observe(document.querySelector("#flight-list"), { childList: true, subtree: true });
window.addEventListener("resize", () => map3d?.resize());

