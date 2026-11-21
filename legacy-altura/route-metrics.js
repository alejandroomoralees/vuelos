(() => {
  const number = value => Number.isFinite(value) ? Math.round(value).toLocaleString("es-ES") : "—";
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const speedsOf = flight => (flight.points || []).filter(point => Number.isFinite(point.time)).map(point => point.speed).filter(Number.isFinite);
  const altitudesOf = flight => (flight.points || []).map(point => point.altitude).filter(Number.isFinite);

  window.alturaFlightMetrics = flight => {
    const altitudes = altitudesOf(flight);
    const speeds = speedsOf(flight);
    return {
      maxAltitude: altitudes.length ? Math.max(...altitudes) : null,
      averageAltitude: altitudes.length ? altitudes.reduce((sum, value) => sum + value, 0) / altitudes.length : null,
      maxSpeed: speeds.length ? Math.max(...speeds) : null,
      averageSpeed: speeds.length ? speeds.reduce((sum, value) => sum + value, 0) / speeds.length : null,
      speedSamples: speeds.length
    };
  };

  window.alturaFlightSummary = flight => {
    const metrics = window.alturaFlightMetrics(flight);
    const altitude = metrics.maxAltitude == null ? "Altitud s/d" : `Alt. máx. ${number(metrics.maxAltitude)} m`;
    const speed = metrics.maxSpeed == null ? "Vel. s/d" : `Vel. máx. ${number(metrics.maxSpeed)} km/h`;
    return `${altitude} · ${speed}`;
  };

  window.alturaRouteTooltip = (flight, from, to) => {
    const altitudeValues = [from?.altitude, to?.altitude].filter(Number.isFinite);
    const speedValues = [from, to].filter(point => Number.isFinite(point?.time) && Number.isFinite(point?.speed)).map(point => point.speed);
    const altitude = altitudeValues.length ? altitudeValues.reduce((sum, value) => sum + value, 0) / altitudeValues.length : null;
    const speed = speedValues.length ? speedValues.reduce((sum, value) => sum + value, 0) / speedValues.length : null;
    return `<div class="route-metric-tooltip"><strong>${escape(flight.name)}</strong><div><span>Altitud</span><b>${altitude == null ? "Sin datos" : `${number(altitude)} m`}</b></div><div><span>Velocidad</span><b>${speed == null ? "Sin datos temporales" : `${number(speed)} km/h`}</b></div></div>`;
  };

  window.alturaSegmentTooltip = properties => {
    const altitude = Number(properties?.altitude);
    const speed = Number(properties?.speed);
    const hasAltitude = Number.isFinite(altitude);
    const hasSpeed = properties?.hasSpeed === true || properties?.hasSpeed === "true";
    return `<div class="route-metric-tooltip"><strong>${escape(properties?.name || "Ruta")}</strong><div><span>Altitud</span><b>${hasAltitude ? `${number(altitude)} m` : "Sin datos"}</b></div><div><span>Velocidad</span><b>${hasSpeed && Number.isFinite(speed) ? `${number(speed)} km/h` : "Sin datos temporales"}</b></div></div>`;
  };
})();
