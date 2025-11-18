import {
  onRestaurantsChange,
  getOwnLocationCordinates,
  zoomAndCenterToFitMarkers,
} from "./mapPublic.js";
import { getDistance } from "geolib";
import { fetchDailyMenu } from "../api/restaurantsApi.js";

let ownPos = null;

function renderRestaurantCards(restaurants) {
  const container = document.getElementById("cards-container");
  const modal = document.getElementById("restaurant-modal");
  const modalTitle = document.getElementById("modal-title");
  const closeBtn = modal.querySelector(".close");
  const modalAddress = document.getElementById("modal-address");
  const modalMenu = document.getElementById("modal-menu");

  container.querySelectorAll(".card").forEach((n) => n.remove());

  restaurants.forEach((restaurant) => {
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

    card.onclick = async () => {
      modalTitle.textContent = restaurant.name;
      modalAddress.textContent = restaurant.address;
      modalMenu.innerHTML = "<p>Ladataan ruokalistaa...</p>";

      modal.style.display = "block";
      container.classList.add("is-modal-open");
      container.scrollTo({
        top: 0,
      });

      try {
        const courses = await fetchDailyMenu(restaurant._id, "en");

        modalMenu.innerHTML = "";
        if (courses && courses.length) {
          courses.forEach((course) => {
            modalMenu.insertAdjacentHTML(
              "beforeend",
              `
              <h2>${course?.name}</h2>
              <p>Price: ${course.price}</p>
              <p>${course.diets}</p>
              `
            );
          });
        } else {
          modalMenu.innerHTML = "Ei ruokalistaa kyseiselle ravintolalle.";
        }
      } catch (err) {
        modalMenu.innerHTML = "<p>Virhe ruokalistan haussa.</p>";
        console.error(err);
      }

      if (restaurant.location?.coordinates) {
        zoomAndCenterToFitMarkers(
          restaurant.location.coordinates[1],
          restaurant.location.coordinates[0]
        );
      }
    };

    container.appendChild(card);
  });

  function closeModal() {
    modal.style.display = "none";
    container.classList.remove("is-modal-open");
  }

  closeBtn.onclick = closeModal;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

onRestaurantsChange((restaurants, location) => {
  if (location) ownPos = location;
  else {
    const coords = getOwnLocationCordinates();
    if (coords) ownPos = coords;
  }
  renderRestaurantCards(restaurants);
});

