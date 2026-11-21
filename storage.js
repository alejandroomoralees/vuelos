const dbPromise = new Promise((resolve, reject) => {
  if (!window.indexedDB) { reject(new Error("IndexedDB no está disponible")); return; }
  const request = indexedDB.open("altura-flight-log", 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains("flights")) db.createObjectStore("flights", { keyPath: "id" });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

function transaction(mode, action) {
  return dbPromise.then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("flights", mode);
    action(tx.objectStore("flights"));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("La operación de almacenamiento se canceló"));
  }));
}

async function loadFlights() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const request = db.transaction("flights", "readonly").objectStore("flights").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

let saveTimer = 0;
let storageFailed = false;
async function saveAll() {
  const rows = window.alturaGetAllFlights?.() || [];
  try {
    await transaction("readwrite", store => {
      store.clear();
      rows.forEach(flight => store.put(flight));
    });
  } catch (error) {
    storageFailed = true;
    console.warn("Altura no pudo guardar la bitácora localmente", error);
    const note = document.querySelector(".import-note");
    if (note) note.textContent = "El navegador no pudo guardar la bitácora localmente. Los vuelos actuales se perderán al cerrar la pestaña.";
  }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAll, 300);
}

dbPromise.then(async () => {
  const saved = await loadFlights();
  if (saved.length) window.alturaRestoreFlights?.(saved);
  const list = document.querySelector("#flight-list");
  new MutationObserver(scheduleSave).observe(list, { childList: true, subtree: true });
}).catch(error => {
  storageFailed = true;
  console.info("El almacenamiento local no está disponible; la bitácora funcionará solo en memoria.", error);
});

window.addEventListener("pagehide", () => { if (!storageFailed) saveAll(); });
