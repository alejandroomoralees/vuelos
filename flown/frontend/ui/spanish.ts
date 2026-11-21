/* Spanish interface layer for Altura. The original Flown layout and behavior remain intact. */
export function startSpanishTranslation(): void {
  const words = new Map(Object.entries({
    "Flown": "Altura",
    "Skip to map": "Ir al mapa",
    "View and share": "Vista y compartir",
    "View": "Vista",
    "Search": "Buscar",
    "Runways": "Pistas",
    "Select flight": "Seleccionar vuelo",
    "Still loading the flights": "Los vuelos aún se están cargando",
    "Select flights to share": "Selecciona vuelos para compartirlos",
    "The flights did not load, use Retry": "No se pudieron cargar los vuelos; pulsa Reintentar",
    "Exporting the map…": "Exportando el mapa…",
    "Exporting…": "Exportando…",
    "Could not export the image. Try again.": "No se pudo exportar la imagen. Inténtalo de nuevo.",
    "Could not copy link. Copy it from here:": "No se pudo copiar el enlace. Cópialo desde aquí:",
    "Drop the files to see your flights": "Suelta los archivos para ver tus vuelos",
    "Close Wrapped to add your flights": "Cierra el resumen anual para añadir tus vuelos",
    "The list of years is unavailable, showing all years": "No está disponible la lista de años; se muestran todos",
    "Could not load the airports": "No se pudieron cargar los aeropuertos",
    "Distance": "Distancia",
    "Flight time": "Tiempo de vuelo",
    "Flight time total": "Tiempo total de vuelo",
    "Highest": "Altitud máxima",
    "Lowest en route": "Altitud mínima en ruta",
    "ft MSL": "ft sobre el nivel del mar",
    "ft AGL": "ft sobre el terreno",
    "ft above field": "ft sobre el aeródromo",
    "Cruise altitude": "Altitud de crucero",
    "Average": "Media",
    "Maximum": "Máximo",
    "Minimum": "Mínimo",
    "Runway": "Pista",
    "Aircraft": "Aeronave",
    "Duration": "Duración",
    "Speed": "Velocidad",
    "Airspeed": "Velocidad indicada",
    "Selected flights": "Vuelos seleccionados",
    "Time": "Tiempo",
    "Countries": "Países",
    "Flight replay": "Reproducción del vuelo",
    "3D view": "Vista 3D",
    "Route": "Ruta",
    "Year": "Año",
    "nm": "mn",
    "Distance (nm)": "Distancia (mn)",
    "Alt ft": "Alt. ft",
    "Highest altitude (ft MSL)": "Altitud máxima (ft MSL)",
    "Ldg": "Atz.",
    "Full-stop landings": "Aterrizajes completos",
    "Landings": "Aterrizajes",
    "Airport": "Aeropuerto",
    "Aircraft fleet": "Flota",
    "of new airspace in total, never flown in the years before.": "de nuevo espacio aéreo en total, nunca sobrevolado en años anteriores.",
    "You flew": "Has volado",
    "around the Earth!": "alrededor de la Tierra.",
    "Loyal to": "Fiel a",
    "different aircraft": "aeronaves diferentes",
    "You flew to airports in": "Has volado a aeropuertos de",
    "countries.": "países.",
    "You crossed borders, visiting": "Has cruzado fronteras y visitado",
    "Averaging": "Con una media de",
    "per trip.": "por vuelo.",
    "Your longest journey:": "Tu viaje más largo:",
    "Total elevation gain:": "Ascenso total:",
    "You climbed": "Has ascendido",
    "x Mount Everest in altitude!": "veces la altura del Everest.",
    "Most common cruise:": "Crucero más habitual:",
    "Total flight time:": "Tiempo total de vuelo:",
    "High altitude achievement:": "Logro de altitud:",
    "touch-and-goes": "tomas y despegues",
    "Favourite runway:": "Pista más utilizada:",
    "No flight in this view has logged time to tour": "Ningún vuelo de esta vista tiene datos horarios para el recorrido",
    "No flight in this view has timing or speed data to replay": "Ningún vuelo de esta vista tiene datos horarios o de velocidad para reproducir",
    "Turn on 3D to lift the flights": "Activa la vista 3D para elevar las rutas",
    "Search is unavailable: its code could not be loaded. Try again.": "La búsqueda no está disponible; no se pudo cargar. Inténtalo de nuevo.",
    "Replay is unavailable: its code could not be loaded. Try again.": "La reproducción no está disponible; no se pudo cargar. Inténtalo de nuevo.",
    "The cross-section is unavailable: its code could not be loaded. Try again.": "El perfil del terreno no está disponible; no se pudo cargar. Inténtalo de nuevo.",
    "Your flights are unavailable: their code could not be loaded. Try again.": "Tus vuelos no están disponibles; no se pudieron cargar. Inténtalo de nuevo.",
    "The hotspot tour is unavailable: its code could not be loaded. Try again.": "El recorrido de zonas populares no está disponible; no se pudo cargar. Inténtalo de nuevo.",
    "Showing the site's flights": "Se muestran los vuelos del sitio",
    "Only KML and KMZ files, and an aircraft.json next to them, can be shown": "Solo se admiten archivos KML y KMZ y un aircraft.json junto a ellos",
    "Building your flights…": "Preparando tus vuelos…",
    "The site was updated: building your flights again…": "El sitio se actualizó: preparando de nuevo tus vuelos…",
    "Built, opening your flights…": "Vuelos preparados; abriéndolos…",
    "Your flights are ready": "Tus vuelos están listos",
    "This link is to the site's flights, so they are shown instead of yours": "Este enlace muestra los vuelos del sitio en lugar de los tuyos",
    "Your files are removed from this browser": "Tus archivos se han eliminado de este navegador",
    "Your files would come to more than 200 MB; remove some first": "Tus archivos superarían los 200 MB; elimina algunos antes",
    "The build is stopped; your files are kept": "Se detuvo el proceso; tus archivos se conservan",
    "Remove all files?": "¿Eliminar todos los archivos?",
    "Nothing was removed": "No se eliminó nada",
    "Build again": "Volver a preparar",
    "No KML or KMZ files were found in what was dropped": "No se encontraron archivos KML o KMZ entre los elementos soltados",
    "Reading the folders…": "Leyendo las carpetas…",
    "Searching places…": "Buscando lugares…",
    "No airport or place found": "No se encontró ningún aeropuerto ni lugar",
    "Type 3 letters or more to search places too": "Escribe al menos 3 letras para buscar lugares",
    "Search airports and places": "Buscar aeropuertos y lugares",
    "Airport, ICAO code or place": "Aeropuerto, código OACI o lugar",
    "Airport, registration or type": "Aeropuerto, matrícula o modelo",
    "Close search": "Cerrar búsqueda",
    "Airports and places": "Aeropuertos y lugares",
    "Map controls": "Controles del mapa",
    "Replay of all flights": "Reproducción de todos los vuelos",
    "Time into every flight": "Tiempo transcurrido de cada vuelo",
    "Aircraft position": "Posición de la aeronave",
    "Close replay": "Cerrar reproducción",
    "Select flights to replay": "Selecciona vuelos para reproducirlos",
    "End": "Finalizar",
    "Your files": "Tus archivos",
    "What the build said": "Avisos del proceso",
    "Remove all files": "Eliminar todos los archivos",
    "Remove all": "Eliminar todo",
    "All": "Todos",
    "Search: find an airport or a place and go there": "Buscar un aeropuerto o lugar y centrar el mapa",
    "Your flights": "Tus vuelos",
    "Your flights: show your own KML files on this map": "Mostrar tus archivos KML en este mapa",
    "Statistics": "Estadísticas",
    "Statistics: the figures and the list of the flights": "Datos y lista de vuelos",
    "Wrapped": "Resumen anual",
    "Wrapped: your flying in review": "Resumen anual de tus vuelos",
    "Cross-section": "Perfil del terreno",
    "Cross-section: draw a line on the map to see the heights flown along it": "Dibuja una línea en el mapa para ver las alturas del recorrido",
    "Pick flights with timing data to replay, under Flights in the statistics": "Selecciona vuelos con datos horarios en Estadísticas para reproducirlos",
    "Replay selected flights": "Reproducir vuelos seleccionados",
    "Replay": "Reproducir",
    "Replay all flights at once": "Reproducir todos los vuelos a la vez",
    "Replay all": "Reproducir todos",
    "Hotspot tour: fly over the busiest places of the heat in 3D": "Sobrevuela en 3D las zonas con más actividad",
    "Hotspot tour": "Recorrido de zonas populares",
    "Share": "Compartir",
    "Share mode": "Modo compartir",
    "Share mode: show only the selected flights and lock the selection": "Mostrar solo los vuelos seleccionados y fijar la selección",
    "Copy link": "Copiar enlace",
    "Copy link to this map view": "Copiar enlace a esta vista del mapa",
    "Export image": "Exportar imagen",
    "Export image of the map": "Exportar imagen del mapa",
    "Filter, layers and map": "Filtros, capas y mapa",
    "Filter": "Filtrar",
    "Filter flights by year": "Filtrar vuelos por año",
    "All years": "Todos los años",
    "Filter flights by aircraft": "Filtrar vuelos por aeronave",
    "All aircraft": "Todas las aeronaves",
    "Layers": "Capas",
    "Heatmap": "Mapa de calor",
    "Heatmap: where the time was spent, brighter where more": "Zonas con más tiempo de vuelo, más brillantes donde se acumula",
    "Airports": "Aeropuertos",
    "Airports: show airport markers": "Mostrar aeropuertos en el mapa",
    "Altitude": "Altitud",
    "Altitude: colour the flights by height": "Colorear los vuelos según su altitud",
    "Groundspeed": "Velocidad respecto al suelo",
    "Groundspeed: colour the flights by speed over the ground": "Colorear los vuelos según su velocidad respecto al suelo",
    "No timing data in the flights": "Los vuelos no contienen datos horarios",
    "Spanish VFR chart": "Carta VFR de España",
    "Spanish VFR chart (ENAIRE)": "Carta VFR de España (ENAIRE)",
    "Map": "Mapa",
    "North up": "Norte arriba",
    "Globe": "Globo",
    "3D": "3D",
    "Satellite": "Satélite",
    "Reset view": "Restablecer vista",
    "Reset view: newest year, all aircraft, heatmap and airports, north up": "Restablecer vista: año más reciente, todas las aeronaves, mapa de calor y norte arriba",
    "Statistics and flights": "Estadísticas y vuelos",
    "Flights": "Vuelos",
    "Altitude colour scale legend": "Escala de colores de altitud",
    "Altitude gradient from low to high, spread by rank": "Gradiente de altitud baja a alta",
    "median ": "mediana ",
    "Groundspeed colour scale legend": "Escala de colores de velocidad",
    "Groundspeed gradient from slow to fast, spread by rank": "Gradiente de velocidad lenta a rápida",
    "Heat colour scale legend": "Escala de colores de actividad",
    "Time spent": "Tiempo acumulado",
    "Less": "Menos",
    "More": "Más",
    "Time spent: blue for about 1 pass of a flight, light cyan for about 64, white for many more": "Tiempo acumulado: azul para un paso, cian claro para unos 64 y blanco para muchos más",
    "What the cloud shows": "Qué representa la nube",
    "Glow:": "Resplandor:",
    "Shadow:": "Sombra:",
    "the heat, at the height flown": "la actividad a la altura del vuelo",
    "the same on the ground, under lifted flights": "la misma actividad en el suelo, bajo las rutas elevadas",
    "Pulses, or chevrons at rest:": "Pulsos o flechas en reposo:",
    "Chevrons:": "Flechas:",
    "the direction flown": "dirección del vuelo",
    "Sharing": "Compartiendo",
    "Share mode: show only these flights and lock the selection": "Mostrar solo estos vuelos y fijar la selección",
    "Copy link to these flights": "Copiar enlace a estos vuelos",
    "Exit share mode, keeping the flights selected": "Salir del modo compartir y mantener los vuelos seleccionados",
    "Exit": "Salir",
    "Clear the selection": "Borrar la selección",
    "Clear": "Borrar",
    "Could not load the flights": "No se pudieron cargar los vuelos",
    "Retry loading the flights": "Reintentar la carga de vuelos",
    "Retry": "Reintentar",
    "Flight map": "Mapa de vuelos",
    "Loading data…": "Cargando datos…",
    "Download progress": "Progreso de descarga",
    "The map did not start. Opened as a file? Serve its folder over HTTP, for": "El mapa no se ha iniciado. ¿Has abierto un archivo local? Sirve la carpeta por HTTP, por ejemplo",
    "Flight replay controls": "Controles de reproducción del vuelo",
    "Replay playback controls": "Controles de reproducción",
    "Play replay": "Iniciar reproducción",
    "Pause replay": "Pausar reproducción",
    "Stop replay and reset to beginning": "Detener la reproducción y volver al inicio",
    "Replay speed multiplier": "Multiplicador de velocidad de reproducción",
    "Auto-zoom: zoom in on the aircraft and keep it in view": "Acercar y mantener la aeronave a la vista",
    "Chase view: follow the aircraft from behind": "Vista de seguimiento desde detrás de la aeronave",
    "Replay timeline position": "Posición en la línea de tiempo",
    "Skip intro": "Saltar introducción",
    "Close Wrapped": "Cerrar resumen anual",
    "Close": "Cerrar",
    "Wrapped cards": "Tarjetas del resumen anual",
    "Your Year in Flight": "Tu año de vuelos",
    "More below": "Más abajo",
    "Flight map overview": "Vista general del mapa de vuelos",
    "Flown source code on GitHub": "Código fuente de Flown en GitHub",
    "Altitude profile": "Perfil de altitud",
    "Show the altitude profile": "Mostrar el perfil de altitud",
    "Hide the altitude profile": "Ocultar el perfil de altitud",
    "Dismiss": "Descartar",
    "No flights": "No hay vuelos",
    "No flight matches": "Ningún vuelo coincide",
    "No timing data for this flight": "Este vuelo no tiene datos horarios",
    "Search flights": "Buscar vuelos",
    "On this flight": "En este vuelo",
    "Unknown": "Desconocido",
    "Set B at the map centre": "Situar B en el centro del mapa",
    "Set A at the map centre": "Situar A en el centro del mapa",
    "B is where A is: move the map, then set B": "B coincide con A: mueve el mapa y vuelve a situar B",
    "Close the cross-section": "Cerrar el perfil del terreno",
    "Select ": "Seleccionar "
  }));

  function translateValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return value;
    if (words.has(trimmed)) return value.replace(trimmed, words.get(trimmed));
    let match = trimmed.match(/^Loading (.*?) flights( \([^)]*\))?…$/);
    if (match) return value.replace(trimmed, `Cargando vuelos${match[1] ? ` de ${match[1]}` : ""}${match[2] || ""}…`);
    match = trimmed.match(/^Could not load the flights of (\d{4})$/);
    if (match) return value.replace(trimmed, `No se pudieron cargar los vuelos de ${match[1]}`);
    match = trimmed.match(/^(\d+) flights?$/);
    if (match) return value.replace(trimmed, `${match[1]} ${match[1] === "1" ? "vuelo" : "vuelos"}`);
    match = trimmed.match(/^Showing your (\d+) flights? from (\d+) files?$/);
    if (match) return value.replace(trimmed, `Mostrando ${match[1]} ${match[1] === "1" ? "vuelo" : "vuelos"} de ${match[2]} ${match[2] === "1" ? "archivo" : "archivos"}`);
    match = trimmed.match(/^Could not load the flights(?: of (\d{4}))?$/);
    if (match) return value.replace(trimmed, `No se pudieron cargar los vuelos${match[1] ? ` de ${match[1]}` : ""}`);
    match = trimmed.match(/^\d+ of \d+$/);
    if (match) return value.replace(trimmed, trimmed.replace(" of ", " de "));
    match = trimmed.match(/^Select (.+)$/);
    if (match) return value.replace(trimmed, `Seleccionar ${match[1]}`);
    match = trimmed.match(/^Cross-section: no (selected )?flight passes (.+)$/);
    if (match) return value.replace(trimmed, `Perfil del terreno: ningún ${match[1] ? "vuelo seleccionado pasa" : "vuelo pasa"} ${match[2]}`);
    return value;
  }

  function translateElement(element: Element): void {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const original = node.nodeValue || "";
      const translated = translateValue(original);
      if (translated !== original) node.nodeValue = translated;
    }
    for (const attr of ["aria-label", "title", "placeholder", "alt", "aria-valuetext"]) {
      if (element.hasAttribute(attr)) {
        const original = element.getAttribute(attr) || "";
        const translated = translateValue(original);
        if (translated !== original) element.setAttribute(attr, translated);
      }
    }
  }

  if (document.body) translateElement(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "childList") record.addedNodes.forEach(node => {
        if (node instanceof Element) translateElement(node);
        else if (node instanceof Text) {
          const original = node.nodeValue || "";
          const translated = translateValue(original);
          if (translated !== original) node.nodeValue = translated;
        }
      });
      if (record.type === "characterData") {
        const original = record.target.nodeValue || "";
        const translated = translateValue(original);
        if (translated !== original) record.target.nodeValue = translated;
      }
      if (record.type === "attributes") translateElement(record.target);
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "title", "placeholder", "alt", "aria-valuetext"]
  });
}
