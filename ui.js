const statsRail = document.querySelector("#sidebar");
const statsButton = document.querySelector("#stats-button");
const rightControls = document.querySelector("#right-buttons");

function showStats(tab = "overview") {
  statsRail.hidden = false;
  statsRail.classList.add("open");
  document.body.classList.add("stats-open");
  statsButton.classList.add("active");
  statsButton.setAttribute("aria-expanded", "true");
  document.querySelector("#mobile-sidebar").setAttribute("aria-expanded", "true");
  rightControls.classList.remove("open");
  const selected = document.querySelector(`.dock-tab[data-tab="${tab}"]`);
  if (selected && !selected.classList.contains("active")) selected.click();
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}

function hideStats() {
  statsRail.classList.remove("open");
  statsRail.hidden = true;
  document.body.classList.remove("stats-open");
  statsButton.classList.remove("active");
  statsButton.setAttribute("aria-expanded", "false");
  document.querySelector("#mobile-sidebar").setAttribute("aria-expanded", "false");
}

statsRail.dataset.tab = "overview";
statsButton.onclick = () => statsRail.hidden ? showStats("overview") : hideStats();
document.querySelector("#mobile-sidebar").onclick = () => showStats("flights");
document.querySelector("#close-sidebar").onclick = hideStats;
document.querySelector("#mobile-layers").onclick = () => {
  hideStats();
  rightControls.classList.toggle("open");
  document.querySelector("#mobile-layers").setAttribute("aria-expanded", rightControls.classList.contains("open") ? "true" : "false");
  if (rightControls.classList.contains("open")) {
    document.querySelector(".layer-controls").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

document.querySelectorAll(".dock-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    statsRail.dataset.tab = tab.dataset.tab;
    document.querySelectorAll(".dock-tab").forEach(item => {
      item.setAttribute("aria-selected", item === tab ? "true" : "false");
    });
  });
});

document.querySelector("#dock-expand").onclick = () => {
  document.querySelector("#bottom-dock").classList.toggle("expanded");
};

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideStats();
    rightControls.classList.remove("open");
    document.querySelector("#mobile-layers").setAttribute("aria-expanded", "false");
  }
});

