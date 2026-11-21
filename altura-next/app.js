import * as maplibregl from "https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs";

const STYLE = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};
const SATELLITE_SOURCE = "altura-imagery";
const ELEVATION_SOURCE = "altura-elevation";
const VFR_AIRSPACE_SOURCE = "altura-enaire-vfr-airspace";
const VFR_ROUTES_SOURCE = "altura-enaire-vfr-routes";
const GROUND_SOURCE = "altura-routes-ground";
const REPLAY_SOURCE = "altura-replay-route";
const STORAGE_DB = "altura-flight-history";
const ALTITUDE_LIMIT_M = 12000;
const MAX_FILE_BYTES = 80 * 1024 * 1024;
const SPANISH_AIRPORT_CODES = {
  LEMD: "MAD", LEBL: "BCN", LEVC: "VLC", LEMG: "AGP", LEPA: "PMI",
  LEIB: "IBZ", LEAL: "ALC", LEZL: "SVQ", LEST: "SCQ", LEBB: "BIO",
  LEAS: "OVD", LECO: "LCG", LEGR: "GRX", LEAM: "LEI", LEBZ: "BJZ",
  LECH: "CDT", LELL: "QSA", LEMH: "MAH", LEMO: "ODB", LEJR: "XRY",
  LEPP: "PNA", LESA: "SLM", LESO: "EAS", LETO: "TOJ", LEVD: "VLL",
  LEVT: "VIT", LEVX: "VGO", LEAB: "ABC", LEGE: "GRO", LERS: "REU",
  GCTS: "TFS", GCXO: "TFN", GCLA: "SPC", GCLP: "LPA", GCFV: "FUE",
  GCRR: "ACE", GCHI: "VDE", GCGM: "GMZ",
};
const COMMON_AIRPORT_CODES = {
  EGLL: "LHR", EGKK: "LGW", EGSS: "STN", EGGW: "LTN", EGCC: "MAN", EGPH: "EDI", EGNM: "LBA",
  LFPG: "CDG", LFPO: "ORY", LFMN: "NCE", LFML: "MRS", LFBO: "TLS", LFBD: "BOD", LFRS: "NTE",
  EHAM: "AMS", EBBR: "BRU", EDDF: "FRA", EDDM: "MUC", LSZH: "ZRH", LSGG: "GVA", LOWW: "VIE",
  LIRF: "FCO", LIMC: "MXP", LIPZ: "VCE", LPPT: "LIS", LTFM: "IST", LGAV: "ATH", EIDW: "DUB",
  EKCH: "CPH", ESSA: "ARN", EFHK: "HEL", ENGM: "OSL", EPWA: "WAW", LKPR: "PRG", LHBP: "BUD",
  LROP: "OTP", LBSF: "SOF", LDZA: "ZAG", LYBE: "BEG", LJLJ: "LJU", LCLK: "LCA", LCPH: "PFO",
  KJFK: "JFK", KEWR: "EWR", KBOS: "BOS", KATL: "ATL", KMIA: "MIA", KORD: "ORD", KDEN: "DEN",
  KSEA: "SEA", KSFO: "SFO", KLAX: "LAX", KLAS: "LAS", KDFW: "DFW", KMCO: "MCO", KPHL: "PHL",
  CYYZ: "YYZ", CYVR: "YVR", MMMX: "MEX", SBGR: "GRU", SAEZ: "EZE", OTHH: "DOH", OMDB: "DXB",
  VHHH: "HKG", RJTT: "HND", RJAA: "NRT", WSSS: "SIN", VTBS: "BKK", ZBAA: "PEK", ZSPD: "PVG",
  RKSI: "ICN", YSSY: "SYD", NZAA: "AKL",
};
const state = { routes: [], mode: "altitude", light: false, satellite: true, threeD: true, vfrChart: false, selected: null, search: "", year: "all", replayIndex: 0, replaying: false };
const map = new maplibregl.Map({
  container: "map",
  style: STYLE.dark,
  center: [-3.7, 40.35],
  zoom: 5.25,
  pitch: 52,
  maxPitch: 82,
  antialias: true,
  attributionControl: false,
  canvasContextAttributes: { antialias: true },
});
map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: true }), "bottom-right");

const $ = (id) => document.getElementById(id);
const fileInput = $("kml-files");
const routeList = $("route-list");
const toast = $("toast");
let toastTimer;
let flightLayer = null;
let airportMarkers = [];
let terrainListener = null;
let dragDepth = 0;
let replayMarker = null;
let replayFrame = null;
let replayStarted = 0;
let replayDuration = 12000;
let storagePromise = null;
let vfrErrorShown = false;

function say(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3600);
}

function codeToIata(code) {
  const token = (code || "").toUpperCase();
  return token.length === 4 ? (SPANISH_AIRPORT_CODES[token] || COMMON_AIRPORT_CODES[token] || token) : token;
}

function distanceKm(a, b) {
  const radians = (value) => value * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function routeFromName(filename) {
  const name = filename.replace(/\\/g, "/").split("/").pop() || filename;
  const match = name.match(/^FlightAware_[^*]+\*([A-Z0-9]{3,4})_([A-Z0-9]{3,4})_\*([^.]*)/i);
  if (!match) return null;
  const raw = match[3];
  const dateMatch = raw.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null;
  const flight = name.match(/^FlightAware_([^*]+)/i)?.[1]?.replace(/[_-]+$/, "") || "Vuelo";
  return {
    originCode: codeToIata(match[1]),
    destinationCode: codeToIata(match[2]),
    date,
    flight,
  };
}

function coordinatesText(text) {
  return text.trim().split(/\s+/).map((part) => {
    const [lon, lat, alt = "0"] = part.split(",");
    const point = { lon: Number(lon), lat: Number(lat), alt: Math.max(0, Number(alt) || 0), time: null };
    return Number.isFinite(point.lon) && Number.isFinite(point.lat) ? point : null;
  }).filter(Boolean);
}

function parseKmlText(text, filename) {
  const documentXml = new DOMParser().parseFromString(text, "application/xml");
  if (documentXml.querySelector("parsererror")) throw new Error("El archivo no contiene un KML válido.");
  const namespace = (name) => documentXml.getElementsByTagNameNS("*", name);
  let points = [];
  const tracks = namespace("Track");
  if (tracks.length) {
    const track = tracks[0];
    const whens = Array.from(track.getElementsByTagNameNS("*", "when"), (node) => Date.parse(node.textContent || ""));
    const coords = Array.from(track.getElementsByTagNameNS("*", "coord"), (node) => {
      const [lon, lat, alt = "0"] = (node.textContent || "").trim().split(/\s+/);
      return { lon: Number(lon), lat: Number(lat), alt: Math.max(0, Number(alt) || 0), time: null };
    }).filter((p) => Number.isFinite(p.lon) && Number.isFinite(p.lat));
    points = coords.map((point, index) => ({ ...point, time: Number.isFinite(whens[index]) ? whens[index] : null }));
  } else {
    const lines = namespace("LineString");
    for (const line of lines) {
      const coords = line.getElementsByTagNameNS("*", "coordinates")[0];
      if (!coords) continue;
      const found = coordinatesText(coords.textContent || "");
      if (found.length > points.length) points = found;
    }
  }
  if (points.length < 2) throw new Error("No se encontró una ruta con dos o más puntos.");
  const name = documentXml.getElementsByTagNameNS("*", "name")[0]?.textContent?.trim();
  const metadata = routeFromName(filename) || {};
  const timeFromKml = points.find((p) => p.time !== null)?.time;
  const date = metadata.date || (timeFromKml ? new Date(timeFromKml).toISOString().slice(0, 10) : null);
  let distance = 0;
  let timedDistance = 0;
  let timedSeconds = 0;
  let maxSpeed = 0;
  const segments = [];
  for (let index = 1; index < points.length; index++) {
    const start = points[index - 1];
    const end = points[index];
    const km = distanceKm(start, end);
    distance += km;
    let speed = null;
    if (start.time !== null && end.time !== null && end.time > start.time) {
      const seconds = (end.time - start.time) / 1000;
      speed = km * 1000 / seconds;
      timedDistance += km;
      timedSeconds += seconds;
      maxSpeed = Math.max(maxSpeed, speed);
    }
    segments.push({ start, end, altitude: (start.alt + end.alt) / 2, speed });
  }
  const maxAltitude = points.reduce((peak, point) => Math.max(peak, point.alt), 0);
  const base = filename.replace(/\.kml$/i, "");
  const origin = metadata.originCode || null;
  const destination = metadata.destinationCode || null;
  return {
    id: crypto.randomUUID(),
    name: origin && destination ? `${origin} → ${destination}` : name || metadata.flight || "Trayecto KML",
    flight: metadata.flight || name || base,
    origin,
    destination,
    date,
    distance,
    maxAltitude,
    avgSpeed: timedSeconds ? timedDistance * 1000 / timedSeconds : null,
    maxSpeed,
    points,
    segments,
  };
}

async function readKml(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} supera el límite de 80 MB.`);
  return parseKmlText(await file.text(), file.name);
}

function openStorage() {
  if (!storagePromise) {
    storagePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore("routes", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacenamiento local."));
    });
  }
  return storagePromise;
}

async function saveRoutes() {
  const database = await openStorage();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction("routes", "readwrite");
    const store = transaction.objectStore("routes");
    store.clear();
    for (const route of state.routes) store.put(route);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("No se pudieron guardar las rutas."));
    transaction.onabort = () => reject(transaction.error || new Error("Se canceló el guardado de las rutas."));
  });
}

async function restoreRoutes() {
  try {
    const database = await openStorage();
    const saved = await new Promise((resolve, reject) => {
      const request = database.transaction("routes", "readonly").objectStore("routes").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No se pudieron recuperar las rutas."));
    });
    if (Array.isArray(saved) && saved.length) {
      state.routes = saved;
      refresh();
      if (map.isStyleLoaded()) fitRoutes();
    }
  } catch (error) {
    console.warn("No se pudo recuperar el historial local:", error);
  }
}

async function acceptFiles(files) {
  const kmlFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith(".kml"));
  if (!kmlFiles.length) return say("Selecciona uno o varios archivos .kml.");
  for (const file of kmlFiles) {
    try {
      const route = await readKml(file);
      state.routes.push(route);
      say(`Ruta añadida: ${route.name}`);
    } catch (error) {
      say(`${file.name}: ${error instanceof Error ? error.message : "no se pudo leer"}`);
    }
  }
  try { await saveRoutes(); } catch { say("Las rutas se muestran, pero el navegador no pudo guardarlas localmente."); }
  refresh();
  fitRoutes();
}

function metricOf(segment) {
  return state.mode === "altitude" ? segment.altitude : segment.speed;
}

function colorFor(value, max) {
  const stops = [[65, 105, 225], [57, 205, 185], [255, 218, 75], [249, 91, 73]];
  const t = Math.max(0, Math.min(0.9999, (value || 0) / Math.max(1, max))) * (stops.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  return [0, 1, 2].map((axis) => (stops[i][axis] + (stops[i + 1][axis] - stops[i][axis]) * f) / 255);
}

function maximumMetric() {
  const values = state.routes.flatMap((route) => route.segments.map(metricOf).filter(Number.isFinite));
  if (!values.length) return state.mode === "altitude" ? ALTITUDE_LIMIT_M : 250;
  const peak = values.reduce((value, current) => Math.max(value, current), 0);
  return peak || (state.mode === "altitude" ? ALTITUDE_LIMIT_M : 250);
}

function groundGeoJson() {
  const max = maximumMetric();
  return {
    type: "FeatureCollection",
    features: state.routes.flatMap((route) => route.segments.map((segment, index) => ({
      type: "Feature",
      properties: { route: route.id, metric: metricOf(segment), segment: index },
      geometry: { type: "LineString", coordinates: [[segment.start.lon, segment.start.lat], [segment.end.lon, segment.end.lat]] },
    }))),
  };
}

function altitudeScale() {
  return Math.max(2, 10 - Math.max(0, Math.min(8, (map.getZoom() - 4))));
}

function buildFlightLayer() {
  if (flightLayer?.program) {
    if (map.getLayer("altura-flights-3d")) map.removeLayer("altura-flights-3d");
  }
  flightLayer = {
    id: "altura-flights-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(_map, gl) {
      this.gl = gl;
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        return shader;
      };
      const vertex = compile(gl.VERTEX_SHADER, `#version 300 es
        uniform mat4 u_matrix;
        in vec3 a_pos;
        in vec3 a_color;
        out vec3 v_color;
        void main() { gl_Position = u_matrix * vec4(a_pos, 1.0); v_color = a_color; }
      `);
      const fragment = compile(gl.FRAGMENT_SHADER, `#version 300 es
        precision highp float;
        in vec3 v_color;
        out vec4 fragColor;
        void main() { fragColor = vec4(v_color, 0.98); }
      `);
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertex);
      gl.attachShader(this.program, fragment);
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program));
      this.buffer = gl.createBuffer();
      this.matrix = gl.getUniformLocation(this.program, "u_matrix");
      this.position = gl.getAttribLocation(this.program, "a_pos");
      this.color = gl.getAttribLocation(this.program, "a_color");
      this.rebuild(gl);
    },
    rebuild(gl = this.gl) {
      const max = maximumMetric();
      const scale = altitudeScale();
      const vertices = [];
      for (const route of state.routes) {
        for (const segment of route.segments) {
          const shade = colorFor(metricOf(segment), max);
          for (const point of [segment.start, segment.end]) {
            const mercator = maplibregl.MercatorCoordinate.fromLngLat({ lng: point.lon, lat: point.lat }, point.alt * scale);
            vertices.push(mercator.x, mercator.y, mercator.z, ...shade);
          }
        }
      }
      this.vertexCount = vertices.length / 6;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    },
    render(gl, args) {
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(this.matrix, false, args.defaultProjectionData.mainMatrix);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.position);
      gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(this.color);
      gl.vertexAttribPointer(this.color, 3, gl.FLOAT, false, 24, 12);
      gl.lineWidth(2.4);
      gl.drawArrays(gl.LINES, 0, this.vertexCount);
    },
    onRemove(_map, gl) {
      if (this.buffer) gl.deleteBuffer(this.buffer);
      if (this.program) gl.deleteProgram(this.program);
    },
  };
  if (map.getLayer("altura-flights-3d")) map.removeLayer("altura-flights-3d");
  map.addLayer(flightLayer);
  map.setLayoutProperty("altura-flights-ground", "visibility", state.threeD ? "none" : "visible");
}

function addTerrain() {
  if (!map.getSource(ELEVATION_SOURCE)) {
    map.addSource(ELEVATION_SOURCE, {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      encoding: "terrarium",
      maxzoom: 15,
      attribution: "Elevation data © AWS Terrain Tiles / Mapzen",
    });
  }
  map.setTerrain(state.threeD ? { source: ELEVATION_SOURCE, exaggeration: 1 } : null);
}

function addImagery() {
  if (!map.getSource(SATELLITE_SOURCE)) {
    map.addSource(SATELLITE_SOURCE, {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    });
  }
  if (!map.getLayer("altura-imagery-layer")) map.addLayer({ id: "altura-imagery-layer", type: "raster", source: SATELLITE_SOURCE, paint: { "raster-opacity": 1 } });
  map.setLayoutProperty("altura-imagery-layer", "visibility", state.satellite ? "visible" : "none");
}

function addVfrChart() {
  const attribution = '<a href="https://insigniavfr.enaire.es/" target="_blank">Cartografía aeronáutica © ENAIRE</a>';
  const services = [
    { source: VFR_AIRSPACE_SOURCE, layer: "altura-enaire-vfr-airspace-layer", service: "InsigniaVFR_VIGOR_Aispace_v2" },
    { source: VFR_ROUTES_SOURCE, layer: "altura-enaire-vfr-routes-layer", service: "InsigniaVFR_Aerovias_v1" },
  ];
  for (const entry of services) {
    if (!map.getSource(entry.source)) {
      map.addSource(entry.source, {
        type: "raster",
        tiles: [`https://servais.enaire.es/insignias/rest/services/INSIGNIA_VFR/${entry.service}/MapServer/export?bbox={bbox-epsg-3857}&size=256,256&format=png32&transparent=true&bboxSR=3857&imageSR=3857&dpi=96&f=image`],
        tileSize: 256,
        attribution,
      });
    }
    if (!map.getLayer(entry.layer)) {
      map.addLayer({ id: entry.layer, type: "raster", source: entry.source, paint: { "raster-opacity": 0.84, "raster-fade-duration": 0 } });
    }
    map.setLayoutProperty(entry.layer, "visibility", state.vfrChart ? "visible" : "none");
  }
  $("vfr-toggle").classList.toggle("is-active", state.vfrChart);
  $("vfr-toggle").setAttribute("aria-pressed", String(state.vfrChart));
}

function addGroundRoutes() {
  const data = groundGeoJson();
  if (!map.getSource(GROUND_SOURCE)) map.addSource(GROUND_SOURCE, { type: "geojson", data, lineMetrics: true });
  else map.getSource(GROUND_SOURCE).setData(data);
  if (!map.getLayer("altura-flights-ground")) {
    map.addLayer({
      id: "altura-flights-ground",
      type: "line",
      source: GROUND_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.5, 10, 3.5],
        "line-opacity": 0.92,
        "line-color": ["interpolate", ["linear"], ["coalesce", ["get", "metric"], 0], 0, "#4169e1", 0.35 * maximumMetric(), "#39cdb9", 0.7 * maximumMetric(), "#ffda4b", maximumMetric(), "#f95b49"],
      },
    });
  }
  buildFlightLayer();
}

function clearAirportMarkers() {
  for (const marker of airportMarkers) marker.remove();
  airportMarkers = [];
}

function addAirportMarkers() {
  clearAirportMarkers();
  const points = new Map();
  for (const route of state.routes) {
    if (!route.points.length) continue;
    const start = route.points[0];
    const end = route.points.at(-1);
    if (route.origin) points.set(`${route.origin}:${start.lon}:${start.lat}`, { code: route.origin, point: start });
    if (route.destination) points.set(`${route.destination}:${end.lon}:${end.lat}`, { code: route.destination, point: end });
  }
  for (const airport of points.values()) {
    const element = document.createElement("div");
    element.className = "airport-marker";
    element.textContent = airport.code;
    element.title = airport.code;
    const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([airport.point.lon, airport.point.lat]).addTo(map);
    airportMarkers.push(marker);
  }
}

function updateLegend() {
  if (state.mode === "altitude") {
    $("legend-title").textContent = "ALTITUD";
    $("legend-low").textContent = "0 m";
    $("legend-high").textContent = `${Math.round(maximumMetric()).toLocaleString("es-ES")} m`;
  } else {
    $("legend-title").textContent = "VELOCIDAD";
    $("legend-low").textContent = "0 km/h";
    $("legend-high").textContent = `${Math.round(maximumMetric() * 3.6)} km/h`;
  }
}

function selectedRoute() {
  return state.routes.find((route) => route.id === state.selected) || null;
}

function visibleRoutes() {
  const query = state.search.trim().toLocaleLowerCase("es");
  return state.routes.filter((route) => {
    const yearMatches = state.year === "all" || route.date?.slice(0, 4) === state.year;
    const searchMatches = !query || `${route.name} ${route.flight} ${route.origin || ""} ${route.destination || ""} ${route.date || ""}`.toLocaleLowerCase("es").includes(query);
    return yearMatches && searchMatches;
  });
}

function updateYearFilter() {
  const select = $("year-filter");
  const prior = state.year;
  const years = [...new Set(state.routes.map((route) => route.date?.slice(0, 4)).filter((year) => /^20\d{2}$/.test(year || "")))].sort().reverse();
  select.replaceChildren(new Option("Todos los años", "all"));
  for (const year of years) select.add(new Option(year, year));
  state.year = years.includes(prior) || prior === "all" ? prior : "all";
  select.value = state.year;
}

function renderProfile(route) {
  const svg = $("altitude-profile");
  svg.replaceChildren();
  const ns = "http://www.w3.org/2000/svg";
  const range = route.points.reduce((result, point) => ({ min: Math.min(result.min, point.alt), max: Math.max(result.max, point.alt) }), { min: Infinity, max: -Infinity });
  const { min, max } = range;
  const span = Math.max(max - min, 100);
  const stride = Math.max(1, Math.ceil(route.points.length / 500));
  const profilePoints = route.points.map((point, index) => ({ point, index })).filter(({ index }) => index % stride === 0 || index === route.points.length - 1);
  const coords = profilePoints.map(({ point, index }) => {
    const x = 8 + index / Math.max(1, route.points.length - 1) * 344;
    const y = 88 - (point.alt - min) / span * 72;
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const area = document.createElementNS(ns, "path");
  area.setAttribute("d", `${coords} L352,90 L8,90 Z`);
  area.setAttribute("class", "profile-area");
  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", coords);
  line.setAttribute("class", "profile-line");
  const baseline = document.createElementNS(ns, "line");
  baseline.setAttribute("x1", "8"); baseline.setAttribute("x2", "352");
  baseline.setAttribute("y1", "90"); baseline.setAttribute("y2", "90"); baseline.setAttribute("class", "profile-baseline");
  svg.append(area, line, baseline);
}

function renderDetails() {
  const route = selectedRoute();
  const section = $("route-details");
  section.hidden = !route;
  if (!route) { stopReplay(); return; }
  $("detail-title").textContent = route.name;
  $("detail-distance").textContent = `${route.distance.toFixed(0)} km`;
  $("detail-altitude").textContent = `${route.maxAltitude.toLocaleString("es-ES", { maximumFractionDigits: 0 })} m`;
  $("detail-speed").textContent = route.avgSpeed ? `${(route.avgSpeed * 3.6).toFixed(0)} km/h` : "Sin datos";
  renderProfile(route);
  const slider = $("replay-range");
  slider.max = String(route.points.length - 1);
  slider.value = String(Math.min(state.replayIndex, route.points.length - 1));
  updateReplayVisuals();
}

function renderRoutes() {
  routeList.replaceChildren();
  updateYearFilter();
  const visible = visibleRoutes();
  $("no-results").hidden = state.routes.length === 0 || visible.length > 0;
  for (const route of visible) {
    const item = document.createElement("li");
    const card = document.createElement("article");
    card.className = `route-card${route.id === state.selected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("aria-label", `${route.name}, ${route.flight}`);
    const head = document.createElement("div");
    head.className = "route-head";
    const name = document.createElement("span");
    name.className = "route-name";
    name.textContent = route.name;
    const date = document.createElement("span");
    date.className = "route-date";
    date.textContent = route.date || "Fecha desconocida";
    head.append(name, date);
    const meta = document.createElement("div");
    meta.className = "route-meta";
    meta.append(document.createTextNode(`${route.flight} · ${route.distance.toFixed(0)} km · ${route.maxAltitude.toFixed(0)} m`));
    if (route.avgSpeed) meta.append(document.createTextNode(` · ${(route.avgSpeed * 3.6).toFixed(0)} km/h`));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "route-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Eliminar ruta ${route.name}`);
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      state.routes = state.routes.filter((entry) => entry.id !== route.id);
      if (state.selected === route.id) state.selected = null;
      void saveRoutes();
      refresh();
      fitRoutes();
    });
    meta.append(remove);
    card.append(head, meta);
    card.addEventListener("click", () => {
      state.selected = route.id;
      state.replayIndex = 0;
      refresh();
      const bounds = new maplibregl.LngLatBounds();
      route.points.forEach((point) => bounds.extend([point.lon, point.lat]));
      map.fitBounds(bounds, { padding: 90, maxZoom: 9, pitch: state.threeD ? 52 : 0 });
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); card.click(); }
    });
    item.append(card);
    routeList.append(item);
  }
  renderDetails();
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hrs ? `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateReplayVisuals() {
  const route = selectedRoute();
  if (!route) {
    if (replayMarker) replayMarker.getElement().hidden = true;
    const source = map.getSource(REPLAY_SOURCE);
    if (source) source.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  const index = Math.max(0, Math.min(route.points.length - 1, state.replayIndex));
  const point = route.points[index];
  if (replayMarker) {
    replayMarker.getElement().hidden = false;
    replayMarker.setLngLat([point.lon, point.lat]);
  }
  const source = map.getSource(REPLAY_SOURCE);
  if (source) {
    const shown = route.points.slice(0, Math.max(2, index + 1));
    const stride = Math.max(1, Math.ceil(shown.length / 1200));
    const coordinates = shown.filter((_, itemIndex) => itemIndex % stride === 0 || itemIndex === shown.length - 1).map((p) => [p.lon, p.lat]);
    source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }
  $("replay-range").value = String(index);
  const firstTime = route.points[0].time;
  const pointTime = point.time;
  const elapsed = firstTime !== null && pointTime !== null ? (pointTime - firstTime) / 1000 : index / Math.max(1, route.points.length - 1) * 7200;
  $("replay-time").textContent = `${formatDuration(elapsed)} · ${Math.round(point.alt).toLocaleString("es-ES")} m`;
}

function stopReplay() {
  if (replayFrame !== null) cancelAnimationFrame(replayFrame);
  replayFrame = null;
  state.replaying = false;
  const button = $("replay-button");
  if (button) button.textContent = "▶ Reproducir";
}

function replayTick(now) {
  const route = selectedRoute();
  if (!route || !state.replaying) return stopReplay();
  const fraction = Math.min(1, Math.max(0, (now - replayStarted) / replayDuration));
  state.replayIndex = Math.round(fraction * (route.points.length - 1));
  updateReplayVisuals();
  if (fraction >= 1) stopReplay();
  else replayFrame = requestAnimationFrame(replayTick);
}

function toggleReplay() {
  const route = selectedRoute();
  if (!route) return;
  if (state.replaying) { stopReplay(); return; }
  if (state.replayIndex >= route.points.length - 1) state.replayIndex = 0;
  replayDuration = Math.min(20000, Math.max(5000, route.points.length * 18));
  replayStarted = performance.now() - state.replayIndex / Math.max(1, route.points.length - 1) * replayDuration;
  state.replaying = true;
  $("replay-button").textContent = "Ⅱ Pausar";
  replayFrame = requestAnimationFrame(replayTick);
}

function updateStats() {
  $("flight-count").textContent = String(state.routes.length);
  const totalDistance = state.routes.reduce((sum, route) => sum + route.distance, 0);
  $("distance-total").innerHTML = `${totalDistance.toLocaleString("es-ES", { maximumFractionDigits: 0 })} <small>km</small>`;
  const peak = Math.max(0, ...state.routes.map((route) => route.maxAltitude));
  $("altitude-max").innerHTML = `${Math.round(peak).toLocaleString("es-ES")} <small>m</small>`;
  $("empty-state").hidden = state.routes.length > 0;
  $("clear-routes").hidden = state.routes.length === 0;
  $("annual-summary-button").hidden = !state.routes.some((route) => /^20\d{2}-/.test(route.date || ""));
  $("map-status").textContent = state.routes.length ? `${state.routes.length} ${state.routes.length === 1 ? "RUTA CARGADA" : "RUTAS CARGADAS"}` : "MAPA DE VUELOS";
}

function openAnnualSummary() {
  const years = [...new Set(state.routes.map((route) => route.date?.slice(0, 4)).filter((year) => /^20\d{2}$/.test(year || "")))].sort().reverse();
  if (!years.length) return say("Carga rutas con fecha para crear el resumen anual.");
  const year = years.includes(state.year) ? state.year : years[0];
  const routes = state.routes.filter((route) => route.date?.startsWith(`${year}-`));
  const months = Array.from({ length: 12 }, (_, index) => ({ label: new Intl.DateTimeFormat("es", { month: "short" }).format(new Date(2024, index, 1)).replace(".", ""), count: 0 }));
  for (const route of routes) {
    const month = Number(route.date.slice(5, 7)) - 1;
    if (month >= 0 && month < 12) months[month].count++;
  }
  const maximum = Math.max(1, ...months.map((month) => month.count));
  const distance = routes.reduce((sum, route) => sum + route.distance, 0);
  const altitude = routes.reduce((peak, route) => Math.max(peak, route.maxAltitude), 0);
  const highlight = routes.reduce((best, route) => !best || route.maxAltitude > best.maxAltitude ? route : best, null);
  $("summary-title").textContent = `Tu ${year} en el aire`;
  $("summary-flights").textContent = String(routes.length);
  $("summary-distance").textContent = `${Math.round(distance).toLocaleString("es-ES")} km`;
  $("summary-altitude").textContent = `${Math.round(altitude).toLocaleString("es-ES")} m`;
  $("summary-highlight").textContent = highlight ? `Tu vuelo más alto fue ${highlight.name}, a ${Math.round(highlight.maxAltitude).toLocaleString("es-ES")} m.` : "Aún no hay vuelos para este año.";
  const bars = $("month-bars");
  bars.replaceChildren();
  for (const month of months) {
    const column = document.createElement("div");
    column.className = "month-column";
    const count = document.createElement("b");
    count.textContent = month.count ? String(month.count) : "";
    const bar = document.createElement("span");
    bar.className = "month-bar";
    bar.style.setProperty("--bar-height", `${month.count / maximum * 100}%`);
    bar.setAttribute("aria-hidden", "true");
    const label = document.createElement("small");
    label.textContent = month.label;
    column.append(count, bar, label);
    bars.append(column);
  }
  $("year-summary").showModal();
}

function refresh() {
  updateStats();
  renderRoutes();
  updateLegend();
  if (!map.isStyleLoaded()) return;
  addGroundRoutes();
  addAirportMarkers();
}

function fitRoutes() {
  const bounds = new maplibregl.LngLatBounds();
  state.routes.forEach((route) => route.points.forEach((point) => bounds.extend([point.lon, point.lat])));
  if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: { top: 100, right: 90, bottom: 100, left: 90 }, maxZoom: 8, pitch: state.threeD ? 52 : 0 });
}

function apply3d() {
  state.threeD = !state.threeD;
  $("terrain-toggle").classList.toggle("is-active", state.threeD);
  $("terrain-toggle").setAttribute("aria-pressed", String(state.threeD));
  map.easeTo({ pitch: state.threeD ? 52 : 0, duration: 700 });
  if (map.isStyleLoaded()) {
    addTerrain();
    if (flightLayer?.rebuild) flightLayer.rebuild();
    if (map.getLayer("altura-flights-ground")) map.setLayoutProperty("altura-flights-ground", "visibility", state.threeD ? "none" : "visible");
    map.triggerRepaint();
  }
}

function setSatellite() {
  state.satellite = !state.satellite;
  $("satellite-toggle").classList.toggle("is-active", state.satellite);
  $("satellite-toggle").setAttribute("aria-pressed", String(state.satellite));
  if (map.isStyleLoaded() && map.getLayer("altura-imagery-layer")) map.setLayoutProperty("altura-imagery-layer", "visibility", state.satellite ? "visible" : "none");
}

function toggleVfrChart() {
  state.vfrChart = !state.vfrChart;
  if (state.vfrChart) vfrErrorShown = false;
  if (map.isStyleLoaded()) addVfrChart();
  else {
    $("vfr-toggle").classList.toggle("is-active", state.vfrChart);
    $("vfr-toggle").setAttribute("aria-pressed", String(state.vfrChart));
  }
}

function setLightMode() {
  state.light = !state.light;
  document.documentElement.dataset.theme = state.light ? "light" : "dark";
  $("theme-toggle").textContent = state.light ? "☾" : "☼";
  $("theme-toggle").title = state.light ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  $("theme-toggle").setAttribute("aria-label", $("theme-toggle").title);
  const center = map.getCenter();
  const view = { center: [center.lng, center.lat], zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
  map.setStyle(STYLE[state.light ? "light" : "dark"]);
  map.once("style.load", () => {
    map.jumpTo(view);
    installMapLayers();
  });
}

function installMapLayers() {
  addTerrain();
  addImagery();
  addVfrChart();
  addGroundRoutes();
  if (!map.getSource(REPLAY_SOURCE)) map.addSource(REPLAY_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  if (!map.getLayer("altura-replay-line")) {
    map.addLayer({ id: "altura-replay-line", type: "line", source: REPLAY_SOURCE, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 4, "line-opacity": 0.95 } });
  }
  if (!replayMarker) {
    const element = document.createElement("div");
    element.className = "replay-marker";
    element.setAttribute("aria-hidden", "true");
    replayMarker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([-3.7, 40.35]).addTo(map);
  }
  updateReplayVisuals();
  addAirportMarkers();
}

function colorMode(mode) {
  state.mode = mode;
  $("altitude-mode").classList.toggle("selected", mode === "altitude");
  $("speed-mode").classList.toggle("selected", mode === "speed");
  $("altitude-mode").setAttribute("aria-pressed", String(mode === "altitude"));
  $("speed-mode").setAttribute("aria-pressed", String(mode === "speed"));
  refresh();
}

function toggleNorth() {
  map.easeTo({ bearing: 0, pitch: state.threeD ? 52 : 0, duration: 500 });
}

$("theme-toggle").addEventListener("click", setLightMode);
$("satellite-toggle").addEventListener("click", setSatellite);
$("vfr-toggle").addEventListener("click", toggleVfrChart);
$("terrain-toggle").addEventListener("click", apply3d);
$("north-toggle").addEventListener("click", toggleNorth);
$("altitude-mode").addEventListener("click", () => colorMode("altitude"));
$("speed-mode").addEventListener("click", () => colorMode("speed"));
$("reset-view").addEventListener("click", () => {
  map.easeTo({ center: [-3.7, 40.35], zoom: 5.25, pitch: state.threeD ? 52 : 0, bearing: 0, duration: 700 });
});
$("clear-routes").addEventListener("click", () => {
  state.routes = [];
  state.selected = null;
  state.replayIndex = 0;
  void saveRoutes();
  refresh();
  clearAirportMarkers();
});
fileInput.addEventListener("change", (event) => {
  void acceptFiles(event.target.files);
  fileInput.value = "";
});
$("route-search").addEventListener("input", (event) => {
  state.search = event.target.value;
  renderRoutes();
});
$("year-filter").addEventListener("change", (event) => {
  state.year = event.target.value;
  renderRoutes();
});
$("replay-range").addEventListener("input", (event) => {
  stopReplay();
  state.replayIndex = Number(event.target.value) || 0;
  updateReplayVisuals();
});
$("replay-button").addEventListener("click", toggleReplay);
$("annual-summary-button").addEventListener("click", openAnnualSummary);
$("close-details").addEventListener("click", () => {
  state.selected = null;
  refresh();
});

map.on("load", () => {
  installMapLayers();
  if (state.routes.length) fitRoutes();
  map.on("zoom", () => {
    if (state.threeD && flightLayer?.rebuild) {
      flightLayer.rebuild();
      map.triggerRepaint();
    }
  });
  map.on("error", (event) => {
    if (state.vfrChart && !vfrErrorShown && event.sourceId?.startsWith("altura-enaire-vfr-")) {
      vfrErrorShown = true;
      say("No se pudo cargar la cartografía VFR de ENAIRE. Puedes abrir Insignia desde el enlace del panel.");
    }
    if (event.error) console.warn("Error de mapa:", event.error.message || event.error);
  });
});
void restoreRoutes();

window.addEventListener("dragenter", (event) => {
  if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
  event.preventDefault();
  dragDepth++;
  $("drop-hint").hidden = false;
});
window.addEventListener("dragover", (event) => {
  if (Array.from(event.dataTransfer?.types || []).includes("Files")) event.preventDefault();
});
window.addEventListener("dragleave", (event) => {
  if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) $("drop-hint").hidden = true;
});
window.addEventListener("drop", (event) => {
  if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
  event.preventDefault();
  dragDepth = 0;
  $("drop-hint").hidden = true;
  void acceptFiles(event.dataTransfer.files);
});

