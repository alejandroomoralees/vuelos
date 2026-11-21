import * as maplibregl from "https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs";

const host = document.querySelector("#map3d");
const modeButton = document.querySelector("#map-mode-button");
const leafMap = window.alturaGetMap?.();
let map3d = null;
let mode = "2d";
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
    }
  },
  layers: [{ id: "osm-base", type: "raster", source: "osm", paint: { "raster-opacity": 1 } }]
};

function getData() {
  const flights = window.alturaGetFlights?.() || [];
  const layer = window.alturaGetLayer?.() || "altitude";
  const pointFeatures = [];
  const routeFeatures = flights.filter(flight => flight.points.length > 1).map(flight => {
    const step = Math.max(1, Math.ceil(flight.points.length / 1800));
    const points = flight.points.filter((_, index) => index % step === 0 || index === flight.points.length - 1);
    const averageAltitude = flight.points.reduce((sum, point) => sum + (point.altitude || 0), 0) / flight.points.length;
    const averageSpeed = flight.points.reduce((sum, point) => sum + (point.speed || 0), 0) / flight.points.length;
    const color = colorFor(layer === "speed" ? averageSpeed : averageAltitude, layer);
    for (let i = 0; i < flight.points.length; i += Math.max(1, step * 3)) {
      const point = flight.points[i];
      pointFeatures.push({ type: "Feature", properties: { weight: Math.min(1, .15 + (point.speed || 0) / 200) }, geometry: { type: "Point", coordinates: [point.lon, point.lat] } });
    }
    return {
      type: "Feature",
      properties: { id: flight.id, name: flight.name, color, altitude: averageAltitude, speed: averageSpeed },
      geometry: { type: "LineString", coordinates: points.map(point => [point.lon, point.lat, point.altitude || 0]) }
    };
  });
  const airportGroups = [];
  for (const flight of flights) for (const point of [flight.points[0], flight.points.at(-1)]) {
    if (!point) continue;
    let airport = airportGroups.find(item => distanceKm(item, point) < 8);
    if (!airport) { airport = { lat: point.lat, lon: point.lon, count: 0 }; airportGroups.push(airport); }
    airport.count++;
  }
  routeData = { type: "FeatureCollection", features: routeFeatures };
  heatData = { type: "FeatureCollection", features: pointFeatures };
  airportData = { type: "FeatureCollection", features: airportGroups.map(airport => ({ type: "Feature", properties: { count: airport.count }, geometry: { type: "Point", coordinates: [airport.lon, airport.lat] } })) };
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
    map3d.on("click", "flight-lines-layer", event => {
      const id = event.features?.[0]?.properties?.id;
      if (id) window.alturaOpenFlight?.(id);
    });
    map3d.on("mouseenter", "flight-lines-layer", () => { map3d.getCanvas().style.cursor = "pointer"; });
    map3d.on("mouseleave", "flight-lines-layer", () => { map3d.getCanvas().style.cursor = ""; });
    refreshMapData();
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

function setMode(next) {
  mode = next;
  if (mode === "2d") {
    host.classList.remove("is-active");
    if (map3d) {
      const center = map3d.getCenter();
      window.alturaGetMap?.()?.setView([center.lat, center.lng], map3d.getZoom(), { animate: false });
    }
    window.alturaGetMap?.()?.invalidateSize();
    modeButton.querySelector("span").textContent = "2D";
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
    modeButton.querySelector("span").textContent = "3D";
    modeButton.title = "Cambiar a vista de globo";
  } else {
    modeButton.querySelector("span").textContent = "Globo";
    modeButton.title = "Volver al mapa 2D";
  }
}

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
