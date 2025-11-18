import {
  onRestaurantsChange,
  getOwnLocationCordinates,
  zoomAndCenterToFitMarkers,
} from "./mapAuthed.js";
import { getDistance } from "geolib";
import {
  fetchDailyMenu,
  fetchWeeklyMenu,
} from "../api/restaurantsApi.js";
import { updateFavoriteRestaurant } from "../api/usersApi.js";

let ownPos = null;
let currentRestaurant = null;

const userRaw = localStorage.getItem("user");
const userData = userRaw ? JSON.parse(userRaw) : null;

let favId = userData?.data?.favouriteRestaurant || null;
let lastRestaurants = [];

function renderRestaurantCards(restaurants) {
  const container = document.getElementById("cards-container");
  const modal = document.getElementById("restaurant-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalAddress = document.getElementById("modal-address");
  const modalMenu = document.getElementById("modal-menu");
  const closeBtn = modal.querySelector(".close");
  const weeklyButton = document.getElementById("weekly-button");
  const dailyButton = document.getElementById("daily-button");
  const favoriteButton = document.getElementById("fav-btn");

  container.querySelectorAll(".card").forEach((n) => n.remove());

  const sorted = [...restaurants].sort((a, b) => {
    if (a._id === favId) return -1;
    if (b._id === favId) return 1;
    return 0;
  });

  favoriteButton.onclick = () => {
    if (!currentRestaurant || !userData) return;
    const isFav = favId && currentRestaurant._id === favId;
    const newFavId = isFav ? "" : currentRestaurant._id;
    updateFavorite(newFavId);
  };

  sorted.forEach((restaurant) => {
    const card = document.createElement("div");
    card.className = "card";

    const name = document.createElement("h3");
    name.textContent = restaurant.name;
    card.appendChild(name);

    const address = document.createElement("p");
    address.textContent = restaurant.address;
    card.appendChild(address);

    const distance = document.createElement("p");
    distance.className = "distance-info";

    if (ownPos && restaurant.location?.coordinates) {
      const [lng, lat] = restaurant.location.coordinates;
      const dist = getDistance(
        { latitude: ownPos.lat, longitude: ownPos.lng },
        { latitude: lat, longitude: lng }
      );
      distance.textContent = `Etäisyys: ${(dist / 1000).toFixed(2)} km`;
    } else {
      distance.textContent = "Hae oma sijainti nähdäksesi etäisyyden";
    }
    card.appendChild(distance);

    if (restaurant._id === favId) {
      const star = document.createElement("span");
      star.textContent = "★";
      star.className = "fav-star";
      card.appendChild(star);
      card.classList.add("favorite-card");
    }

    card.onclick = async () => {
      currentRestaurant = restaurant;

      if (restaurant._id === favId) {
        favoriteButton.classList.add("active");
      } else {
        favoriteButton.classList.remove("active");
      }

      modalTitle.textContent = restaurant.name;
      modalAddress.textContent = restaurant.address;
      modalMenu.innerHTML = "<p>Ladataan ruokalistaa...</p>";

      modal.style.display = "block";
      container.classList.add("is-modal-open");
      container.scrollTo({ top: 0 });

      try {
        const [dailyCourses, weeklyCourses] = await Promise.all([
          fetchDailyMenu(restaurant._id, "fi"),
          fetchWeeklyMenu(restaurant._id, "fi"),
        ]);

        const renderCourses = (courses) => {
          modalMenu.innerHTML = "";
          if (!courses || !courses.length) {
            modalMenu.innerHTML =
              "<p>Ei ruokalistaa tälle ravintolalle.</p>";
            return;
          }

          courses.forEach((course) => {
            modalMenu.insertAdjacentHTML(
              "beforeend",
              `
              <h2>${course?.name || "Nimetön ruoka"}</h2>
              <p>Hinta: ${course?.price || "Ei tiedossa"}</p>
              <p>${course?.diets || "Ei ruokavalioita"}</p>
            `
            );
          });
        };

        if (dailyButton) {
          dailyButton.onclick = () => renderCourses(dailyCourses);
        }
        if (weeklyButton) {
          weeklyButton.onclick = () => renderCourses(weeklyCourses);
        }

        renderCourses(dailyCourses);

        if (restaurant.location?.coordinates) {
          const [lng, lat] = restaurant.location.coordinates;
          zoomAndCenterToFitMarkers(lat, lng);
        }
      } catch (err) {
        console.error("Ruokalistan haku epäonnistui:", err);
        modalMenu.innerHTML = "<p>Virhe ruokalistan haussa.</p>";
      }
    };

    container.appendChild(card);
  });

  function closeModal() {
    modal.style.display = "none";
    container.classList.remove("is-modal-open");
    modalMenu.innerHTML = "";
    currentRestaurant = null;
    favoriteButton.classList.remove("active");
  }

  closeBtn.onclick = closeModal;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

async function updateFavorite(newFavId) {
  if (!userData) return;

  try {
    await updateFavoriteRestaurant(userData.token, newFavId || "");

    favId = newFavId || null;
    if (!userData.data) {
      userData.data = {};
    }
    userData.data.favouriteRestaurant = favId;
    localStorage.setItem("user", JSON.stringify(userData));

    const favBtn = document.getElementById("fav-btn");
    if (currentRestaurant && favBtn) {
      if (favId && currentRestaurant._id === favId) {
        favBtn.classList.add("active");
      } else {
        favBtn.classList.remove("active");
      }
    }

    if (lastRestaurants.length) {
      renderRestaurantCards(lastRestaurants);
    }
  } catch (err) {
    console.error("Failed to update favourite restaurant:", err);
  }
}

onRestaurantsChange((restaurants, location) => {
  lastRestaurants = restaurants;

  if (location) {
    ownPos = location;
  } else {
    const coords = getOwnLocationCordinates();
    if (coords) ownPos = coords;
  }

  renderRestaurantCards(restaurants);
});

