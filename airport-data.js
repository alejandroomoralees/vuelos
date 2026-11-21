const GRID_SIZE = 2;
let airports = [];
let grid = new Map();
let loading = false;
let loaded = false;

function csvRows(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function makeGrid(records) {
  const result = new Map();
  for (const airport of records) {
    const key = `${Math.floor(airport.lat * GRID_SIZE)}:${Math.floor(airport.lon * GRID_SIZE)}`;
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(airport);
  }
  return result;
}

async function fetchCsv(url) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`No se pudo descargar la base de aeropuertos (${response.status})`);
  return response.text();
}

async function loadAirports() {
  if (loading || loaded) return;
  loading = true;
  window.alturaShowToast?.("Cargando el catálogo público de aeropuertos…", 5000);
  try {
    let text;
    try { text = await fetchCsv("https://ourairports.com/data/airports.csv"); }
    catch { text = await fetchCsv("https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv"); }
    const rows = csvRows(text);
    if (!rows.length) throw new Error("El catálogo descargado está vacío");
    const header = new Map(rows.shift().map((name, index) => [name.trim(), index]));
    const field = (row, name) => row[header.get(name)] || "";
    airports = rows.flatMap(row => {
      const type = field(row, "type");
      if (!["large_airport", "medium_airport", "small_airport", "closed"].includes(type)) return [];
      const lat = Number(field(row, "latitude_deg")), lon = Number(field(row, "longitude_deg"));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
      const ident = field(row, "ident").trim().toUpperCase();
      const gps = field(row, "gps_code").trim().toUpperCase();
      const iata = field(row, "iata_code").trim().toUpperCase();
      const icao = /^[A-Z]{4}$/.test(gps) ? gps : /^[A-Z]{4}$/.test(ident) ? ident : "";
      return [{ id: field(row, "id") || ident || `${lat}:${lon}`, code: icao || iata || ident, icao, iata, ident, name: field(row, "name"), type, lat, lon, city: field(row, "municipality"), country: field(row, "iso_country"), elevationFt: Number(field(row, "elevation_ft")) || 0 }];
    });
    grid = makeGrid(airports);
    loaded = true;
    window.alturaShowToast?.(`${airports.length.toLocaleString("es-ES")} aeropuertos listos para identificar tus escalas.`);
    window.alturaRefreshAirports?.();
  } catch (error) {
    console.warn("No se pudo cargar el catálogo de aeropuertos", error);
    window.alturaShowToast?.("No se pudo cargar el catálogo de aeropuertos; se mostrarán los puntos aproximados.");
  } finally { loading = false; }
}

window.alturaNearestAirport = point => {
  if (!grid.size) return null;
  const y = Math.floor(point.lat * GRID_SIZE), x = Math.floor(point.lon * GRID_SIZE);
  const cos = Math.max(.08, Math.cos(point.lat * Math.PI / 180));
  const radiusX = Math.min(12, Math.ceil(10 / (111.32 * cos) * GRID_SIZE) + 1);
  let best = null, bestDistance = 10;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -radiusX; dx <= radiusX; dx++) {
    const records = grid.get(`${y + dy}:${x + dx}`) || [];
    for (const airport of records) {
      const dLat = (airport.lat - point.lat) * Math.PI / 180, dLon = (airport.lon - point.lon) * Math.PI / 180;
      const n = Math.sin(dLat / 2) ** 2 + Math.cos(point.lat * Math.PI / 180) * Math.cos(airport.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const distance = 6371 * 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
      if (distance < bestDistance) { bestDistance = distance; best = airport; }
    }
  }
  return best ? { ...best, matchDistanceKm: bestDistance } : null;
};

const flightList = document.querySelector("#flight-list");
new MutationObserver(() => { if (!loaded && !loading && (window.alturaGetAllFlights?.().length || 0)) loadAirports(); }).observe(flightList, { childList: true, subtree: true });
