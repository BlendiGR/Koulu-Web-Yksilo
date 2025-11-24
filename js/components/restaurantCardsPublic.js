import {
  onRestaurantsChange,
  getOwnLocationCordinates,
  zoomAndCenterToFitMarkers,
} from "./map.js";

import { getDistance } from "geolib";
import { fetchDailyMenu, fetchWeeklyMenu } from "../api/restaurantsApi.js";

let ownPos = null;
let lastRestaurants = [];

const panel = document.getElementById("menu-panel");
const closePanelBtn = panel.querySelector(".menu-close");

const mpTitle = document.getElementById("mp-title");
const mpAddress = document.getElementById("mp-address");
const mpMenu = document.getElementById("mp-menu");

const mpDaily = document.getElementById("mp-daily");
const mpWeekly = document.getElementById("mp-weekly");
const mpHiddenId = document.getElementById("mp-restaurant-id");

const mpFavBtn = document.getElementById("mp-fav-btn");
if (mpFavBtn) mpFavBtn.style.display = "none";

function openMenuPanel(r) {
  mpHiddenId.textContent = r._id;

  mpTitle.textContent = r.name;
  mpAddress.textContent = r.address;
  mpMenu.innerHTML = "<p>Ladataan...</p>";

  panel.classList.add("open");

  loadMenu(r._id);
}

closePanelBtn.onclick = () => panel.classList.remove("open");

async function loadMenu(id) {
  const [dailyCourses, weeklyMenu] = await Promise.all([
    fetchDailyMenu(id, "fi"),
    fetchWeeklyMenu(id, "fi"),
  ]);

  function setActive(btn) {
    mpDaily.classList.remove("active");
    mpWeekly.classList.remove("active");
    btn.classList.add("active");
  }

  function renderDaily() {
    setActive(mpDaily);
    mpMenu.innerHTML = "";

    if (!dailyCourses?.length) {
      mpMenu.innerHTML = "<p>Ei ruokalistaa.</p>";
      return;
    }

    dailyCourses.forEach((c) => {
      mpMenu.insertAdjacentHTML(
        "beforeend",
        `
        <div class="menu-item">
          <h3>${c.name}</h3>
          <p>${c.price || ""}</p>
          <p>${c.diets || ""}</p>
        </div>
      `
      );
    });
  }

  function renderWeekly() {
    setActive(mpWeekly);
    mpMenu.innerHTML = "";

    const days = Array.isArray(weeklyMenu?.days) ? weeklyMenu.days : weeklyMenu;

    if (!days?.length) {
      mpMenu.innerHTML = "<p>Ei viikkolistaa.</p>";
      return;
    }

    days.forEach((day) => {
      const label = new Date(day.date).toLocaleDateString("fi-FI", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });

      mpMenu.insertAdjacentHTML("beforeend", `<h3>${label}</h3>`);

      day.courses?.forEach((c) => {
        mpMenu.insertAdjacentHTML(
          "beforeend",
          `
          <div class="weekly-course">
            <p><strong>${c.name}</strong></p>
            <p>${c.price || ""}</p>
            <p>${c.diets || ""}</p>
          </div>
        `
        );
      });
    });
  }

  mpDaily.onclick = renderDaily;
  mpWeekly.onclick = renderWeekly;

  renderDaily();
}

function createCard(r) {
  const card = document.createElement("div");
  card.className = "card";

  const distText =
    ownPos && r.location?.coordinates
      ? (() => {
          const [lng, lat] = r.location.coordinates;
          const d = getDistance(
            { latitude: ownPos.lat, longitude: ownPos.lng },
            { latitude: lat, longitude: lng }
          );
          return `Etäisyys: ${(d / 1000).toFixed(2)} km`;
        })()
      : "Hae oma sijainti nähdäksesi etäisyyden";

  card.innerHTML = `
    <h3>${r.name}</h3>
    <p>${r.address}</p>
    <p class="distance-info">${distText}</p>
  `;

  card.onclick = () => {
    openMenuPanel(r);
    zoomAndCenterToFitMarkers(
      r.location.coordinates[1],
      r.location.coordinates[0]
    );
  };

  return card;
}

function renderRestaurantCards(restaurants) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  restaurants.forEach((r) => container.appendChild(createCard(r)));
}

onRestaurantsChange((restaurants, location) => {
  lastRestaurants = restaurants;
  ownPos = location || getOwnLocationCordinates() || null;
  renderRestaurantCards(restaurants);
});
