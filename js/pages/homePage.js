import "../components/mapPublic.js";
import "../components/restaurantCardsPublic.js";

export function initHomePage() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
}

