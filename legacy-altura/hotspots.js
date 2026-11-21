const button = document.querySelector("#hotspot-button");
let tour = [];
let tourIndex = 0;
let timer = 0;

function gatherHotspots() {
  const flights = window.alturaGetFlights?.() || [];
  const bins = new Map();
  for (const flight of flights) {
    const step = Math.max(1, Math.ceil(flight.points.length / 5000));
    for (let i = 0; i < flight.points.length; i += step) {
      const point = flight.points[i];
      const lat = Math.round(point.lat * 4) / 4, lon = Math.round(point.lon * 4) / 4;
      const key = `${lat}:${lon}`;
      const next = flight.points[Math.min(flight.points.length - 1, i + step)];
      const seconds = point.time != null && next?.time != null ? Math.max(1, (next.time - point.time) / 1000) : 1;
      const item = bins.get(key) || { lat, lon, score: 0, visits: 0, flights: new Set() };
      item.score += Math.min(seconds, 60); item.visits++; item.flights.add(flight.id); bins.set(key, item);
    }
  }
  const sorted = [...bins.values()].filter(item => item.score > 3).sort((a, b) => b.score - a.score);
  const chosen = [];
  for (const item of sorted) {
    if (chosen.every(other => Math.hypot(other.lat - item.lat, (other.lon - item.lon) * Math.cos(item.lat * Math.PI / 180)) > .55)) chosen.push(item);
    if (chosen.length === 5) break;
  }
  return chosen;
}

function stopTour() {
  clearTimeout(timer); tour = []; button.classList.remove("active"); (button.querySelector(".control-label") || button.querySelector("span")).textContent = "Tour"; button.title = "Recorrer zonas con más actividad";
  window.alturaGetMap?.()?.closePopup();
}

function visitNext() {
  const map = window.alturaGetMap?.();
  if (!map || !tour.length) return stopTour();
  if (tourIndex >= tour.length) return stopTour();
  const place = tour[tourIndex++];
  map.flyTo([place.lat, place.lon], 9, { duration: 1.4 });
  timer = setTimeout(() => {
    L.popup({ closeButton: false, autoClose: false, closeOnClick: false, className: "hotspot-popup" })
      .setLatLng([place.lat, place.lon])
      .setContent(`<b>Zona de actividad ${tourIndex} / ${tour.length}</b><br>${place.visits.toLocaleString("es-ES")} puntos · ${place.flights.size} vuelos`)
      .openOn(map);
    timer = setTimeout(visitNext, 2200);
  }, 1500);
}

button.addEventListener("click", () => {
  if (tour.length) return stopTour();
  tour = gatherHotspots(); tourIndex = 0;
  if (!tour.length) { window.alturaShowToast?.("Importa vuelos para recorrer las zonas de actividad."); return; }
  if (window.alturaMapMode?.() !== "2d") window.alturaSetMapMode?.("2d");
  button.classList.add("active"); (button.querySelector(".control-label") || button.querySelector("span")).textContent = "Parar"; button.title = "Detener la visita guiada";
  visitNext();
});
