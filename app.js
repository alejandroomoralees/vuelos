const flights = [];
const $ = (selector) => document.querySelector(selector);
const fileInput = $("#file-input");
const dropzone = $("#dropzone");

function openPicker() { fileInput.click(); }
$("#header-import").addEventListener("click", openPicker);
$("#hero-import").addEventListener("click", () => $("#importar").scrollIntoView({ behavior: "smooth" }));
$("#browse").addEventListener("click", (event) => { event.stopPropagation(); openPicker(); });
$("#empty-import").addEventListener("click", () => $("#importar").scrollIntoView({ behavior: "smooth" }));
dropzone.addEventListener("click", openPicker);
dropzone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); } });
fileInput.addEventListener("change", (event) => importFiles([...event.target.files]));
for (const type of ["dragenter", "dragover"]) dropzone.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.add("dragover"); });
for (const type of ["dragleave", "drop"]) dropzone.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.remove("dragover"); });
dropzone.addEventListener("drop", (event) => importFiles([...event.dataTransfer.files]));
$("#year-filter").addEventListener("change", render);

async function importFiles(files) {
  const kmlFiles = files.filter((file) => file.name.toLowerCase().endsWith(".kml") || file.type.includes("xml"));
  const message = $("#import-message");
  if (!kmlFiles.length) { message.textContent = "Elige uno o varios archivos .kml para importar."; return; }
  let added = 0;
  for (const file of kmlFiles) {
    try {
      const flight = parseKml(await file.text(), file.name);
      if (!flight.points.length) continue;
      const existing = flights.findIndex((item) => item.name === flight.name);
      if (existing >= 0) flights[existing] = flight; else flights.push(flight);
      added++;
    } catch { /* A malformed file is skipped without interrupting the remaining imports. */ }
  }
  if (added) { message.textContent = `${added} ${added === 1 ? "vuelo añadido" : "vuelos añadidos"}. Los datos se procesan solo en este dispositivo.`; updateYears(); render(); }
  else message.textContent = "No encontramos trazas de vuelo válidas en esos archivos KML.";
  fileInput.value = "";
}

function parseKml(source, filename) {
  const documentXml = new DOMParser().parseFromString(source, "application/xml");
  if (documentXml.querySelector("parsererror")) throw new Error("KML inválido");
  const points = [];
  const times = [];
  const trackNodes = [...documentXml.getElementsByTagNameNS("*", "Track")];
  for (const track of trackNodes) {
    const coords = [...track.getElementsByTagNameNS("*", "coord")];
    const whens = [...track.getElementsByTagNameNS("*", "when")];
    coords.forEach((node, index) => {
      const [lon, lat, alt = 0] = node.textContent.trim().split(/\s+/).map(Number);
      if (Number.isFinite(lon) && Number.isFinite(lat)) points.push({ lon, lat, alt: Number(alt) || 0 });
      const date = new Date(whens[index]?.textContent ?? "");
      if (!Number.isNaN(date.valueOf())) times.push(date);
    });
  }
  if (!points.length) {
    for (const node of documentXml.getElementsByTagNameNS("*", "coordinates")) {
      for (const tuple of node.textContent.trim().split(/\s+/)) {
        const [lon, lat, alt = 0] = tuple.split(",").map(Number);
        if (Number.isFinite(lon) && Number.isFinite(lat)) points.push({ lon, lat, alt: Number(alt) || 0 });
      }
    }
  }
  const name = documentXml.querySelector("Placemark > name, Document > name")?.textContent.trim() || filename.replace(/\.kml$/i, "");
  const distance = points.slice(1).reduce((total, point, index) => total + haversine(points[index], point), 0);
  const duration = times.length > 1 ? Math.max(0, (Math.max(...times.map(Number)) - Math.min(...times.map(Number))) / 3600000) : 0;
  const date = times.length ? new Date(Math.min(...times.map(Number))) : null;
  return { name, points, distance, duration, altitude: Math.max(0, ...points.map((point) => point.alt)), year: date?.getFullYear() ?? null, date };
}

function haversine(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function updateYears() {
  const select = $("#year-filter"), selected = select.value;
  const years = [...new Set(flights.map((flight) => flight.year).filter(Boolean))].sort((a, b) => b - a);
  select.innerHTML = '<option value="all">Todos los años</option>' + years.map((year) => `<option value="${year}">${year}</option>`).join("");
  if (years.includes(Number(selected))) select.value = selected;
}

function currentFlights() {
  const year = $("#year-filter").value;
  return flights.filter((flight) => year === "all" || flight.year === Number(year));
}

function formatDuration(hours) {
  if (!hours) return "—";
  const wholeHours = Math.floor(hours), minutes = Math.round((hours - wholeHours) * 60);
  return wholeHours ? `${wholeHours}h ${minutes}m` : `${minutes}m`;
}

function render() {
  const shown = currentFlights();
  const distance = shown.reduce((sum, flight) => sum + flight.distance, 0);
  const duration = shown.reduce((sum, flight) => sum + flight.duration, 0);
  const altitude = Math.max(0, ...shown.map((flight) => flight.altitude));
  $("#stat-count").textContent = shown.length || "—";
  $("#stat-distance").textContent = shown.length ? Math.round(distance).toLocaleString("es-ES") : "—";
  $("#stat-time").textContent = formatDuration(duration);
  $("#stat-altitude").textContent = altitude ? Math.round(altitude).toLocaleString("es-ES") : "—";
  $("#flight-count").textContent = `${shown.length} ${shown.length === 1 ? "REGISTRO" : "REGISTROS"}`;
  if (shown.length) {
    const longest = [...shown].sort((a, b) => b.distance - a.distance)[0];
    $("#highlight-title").innerHTML = `Tu vuelo más largo<br /><em>te llevó lejos.</em>`;
    $("#highlight-copy").textContent = longest.name;
    $("#highlight-number").textContent = Math.round(longest.distance).toLocaleString("es-ES");
    $("#highlight-unit").textContent = "KILÓMETROS EN UN VUELO";
  } else {
    $("#highlight-title").innerHTML = `Tu próxima historia<br />empieza aquí.`;
    $("#highlight-copy").textContent = "Importa tus vuelos y descubre los hitos de tu temporada.";
    $("#highlight-number").textContent = "✦";
    $("#highlight-unit").textContent = "LISTOS PARA DESPEGAR";
  }
  renderMap(shown);
  renderList(shown);
}

function renderMap(items) {
  const routes = $("#map-routes"), markers = $("#map-points"), empty = $(".map-empty");
  routes.replaceChildren(); markers.replaceChildren(); $("#graticule").replaceChildren();
  empty.style.display = items.length ? "none" : "block";
  const project = ({ lon, lat }) => ({ x: (lon + 180) / 360 * 1200, y: (90 - lat) / 180 * 520 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = (90 - lat) / 180 * 520;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", `M0 ${y} H1200`); line.setAttribute("class", "grid-line"); $("#graticule").append(line);
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = (lon + 180) / 360 * 1200;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", `M${x} 0 V520`); line.setAttribute("class", "grid-line"); $("#graticule").append(line);
  }
  for (const flight of items) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", flight.points.map((point, index) => { const p = project(point); return `${index ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; }).join(" "));
    path.setAttribute("class", "map-route"); routes.append(path);
    for (const index of [0, flight.points.length - 1]) {
      const p = project(flight.points[index]), dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", "4"); dot.setAttribute("class", "map-point"); markers.append(dot);
    }
  }
}

function renderList(items) {
  const list = $("#flight-list");
  if (!items.length) {
    list.innerHTML = '<div class="empty-list"><span>✈</span><p>Tu bitácora te espera.<br /><button class="text-button" id="empty-import">Importa archivos KML para empezar.</button></p></div>';
    $("#empty-import").addEventListener("click", () => $("#importar").scrollIntoView({ behavior: "smooth" }));
    return;
  }
  list.innerHTML = items.map((flight, index) => `<article class="flight-row"><span class="flight-index">${String(index + 1).padStart(2, "0")}</span><div><div class="flight-name">${escapeHtml(flight.name)}</div><div class="flight-sub">${flight.year ?? "FECHA SIN REGISTRAR"}</div></div><div class="flight-metric"><strong>${Math.round(flight.distance).toLocaleString("es-ES")} km</strong><div class="flight-sub">DISTANCIA</div></div><div class="flight-metric"><strong>${formatDuration(flight.duration)}</strong><div class="flight-sub">EN EL AIRE</div></div><span class="flight-arrow">↗</span></article>`).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

render();
