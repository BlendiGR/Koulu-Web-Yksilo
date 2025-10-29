import {
  onRestaurantsChange,
  getOwnLocationCordinates,
  zoomAndCenterToFitMarkers,
} from "./map.js";
import { getDistance } from "geolib";

let ownPos = null;

function renderRestaurantCards(restaurants) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";
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

    distance.id = "distance-info";
    card.appendChild(distance);
    card.onclick = () => {
      zoomAndCenterToFitMarkers(
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0]
      );
    };

    container.appendChild(card);
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
