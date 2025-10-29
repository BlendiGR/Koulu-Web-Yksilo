import { getDistance } from "geolib";

let allRestaurantData = [];
let visibleRestaurantData = [];
let subscribers = new Set();
let currentMarkers = [];
let ownLocationMarker = null;
let mapInstance; // <gmp-map>

export async function initMap() {
  mapInstance = document.querySelector("gmp-map");
  if (!mapInstance) {
    console.error("Map element not found!");
    return;
  }

  const autocompleteInput = document.getElementById("autocomplete-input");
  const autocomplete = new google.maps.places.Autocomplete(autocompleteInput);

  let currentCenter = parseCenterAttr(mapInstance.getAttribute("center"));

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) return;

    currentCenter = { lat: loc.lat(), lng: loc.lng() };
    zoomAndCenterToFitMarkers(currentCenter.lat, currentCenter.lng);
    displayOwnLocationMarker(currentCenter.lat, currentCenter.lng);
    const ordered = orderByProximity(visibleRestaurantData);
    setVisibleRestaurantData(ordered);
  });

  try {
    const res = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allRestaurantData = await res.json();

    displayMarkers(allRestaurantData);
    setVisibleRestaurantData(allRestaurantData);

    // Search UI
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const clearSearchButton = document.getElementById("clear-search-button");
    searchButton.addEventListener("click", handleSearch);
    clearSearchButton.addEventListener("click", handleClearSearch);
    searchInput.addEventListener(
      "keypress",
      (e) => e.key === "Enter" && handleSearch()
    );
  } catch (err) {
    console.error("Init error:", err);
  }
}

function parseCenterAttr(attr) {
  if (!attr) return null;
  const [latStr, lngStr] = attr.split(",").map((s) => s.trim());
  const lat = parseFloat(latStr),
    lng = parseFloat(lngStr);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function clearMarkers() {
  currentMarkers.forEach((m) => m.remove?.());
  currentMarkers = [];
}

function displayMarkers(data) {
  clearMarkers();
  data.forEach((item) => {
    if (!item?.location?.coordinates || item.location.coordinates.length < 2)
      return;
    const [lng, lat] = item.location.coordinates; // [lon, lat]
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const marker = document.createElement("gmp-advanced-marker");
    marker.setAttribute("position", `${lat}, ${lng}`);
    marker.setAttribute("title", item.name ?? "Restaurant");
    marker.setAttribute("gmp-clickable", "");

    const infoWindowContent = `
      <div>
        <h3 style="margin:0 0 6px">${item.name ?? "Restaurant"}</h3>
        ${item.phone ? `<p style="margin:0 0 4px">${item.phone}</p>` : ""}
        <p style="margin:0"><strong>Address:</strong> ${item.address ?? ""}</p>
        <p style="margin:0"><strong>City:</strong> ${item.city ?? "N/A"}</p>
        ${
          item.company
            ? `<p style="margin:4px 0 0"><strong>Company:</strong> ${item.company}</p>`
            : ""
        }
      </div>`;

    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      ariaLabel: item.name ?? "Restaurant",
    });

    marker.addEventListener("gmp-click", () => {
      infoWindow.open({ anchor: marker, map: mapInstance });
    });

    mapInstance.appendChild(marker);
    currentMarkers.push(marker);
  });
}

/// HELPERS

function displayOwnLocationMarker(lat, lng) {
  if (ownLocationMarker) {
    ownLocationMarker.remove();
    ownLocationMarker = null;
  }
  const marker = document.createElement("gmp-advanced-marker");
  marker.setAttribute("position", `${lat}, ${lng}`);
  marker.setAttribute("title", "Your Location");
  const pin = document.createElement("gmp-pin");
  pin.setAttribute("background", "#4285F4");
  pin.setAttribute("border-color", "#1A73E8");
  pin.setAttribute("glyph-color", "white");
  marker.appendChild(pin);
  mapInstance.appendChild(marker);
  ownLocationMarker = marker;
}

export function zoomAndCenterToFitMarkers(lat, lng) {
  mapInstance.setAttribute("center", `${lat}, ${lng}`);
  mapInstance.setAttribute("zoom", "12");
}

function handleSearch() {
  const el = document.getElementById("search-input");
  const query = (el?.value ?? "").toLowerCase().trim();

  if (!query) {
    displayMarkers(allRestaurantData);
    return;
  }

  const filtered = allRestaurantData.filter((item) => {
    const hay = [
      item.name,
      item.address,
      item.city,
      item.postalCode,
      item.company,
      item.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  });

  const ordered = orderByProximity(filtered);
  setVisibleRestaurantData(ordered);
  displayMarkers(ordered);

  if (ordered.length > 0 && ordered[0]?.location?.coordinates?.length >= 2) {
    const [lng, lat] = ordered[0].location.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      zoomAndCenterToFitMarkers(lat, lng);
    }
  }
}

function handleClearSearch() {
  const el = document.getElementById("search-input");
  if (el) el.value = "";

  displayMarkers(allRestaurantData);
  setVisibleRestaurantData(allRestaurantData);
}

export function getOwnLocationCordinates() {
  if (ownLocationMarker) {
    const positionString = ownLocationMarker.getAttribute("position");
    if (positionString) {
      const parts = positionString.split(",").map((part) => part.trim());
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      return { lat: lat, lng: lng };
    }
  }
  return null;
}

function orderByProximity(data) {
  const loc = getOwnLocationCordinates();
  if (!loc) return data;

  return data.sort((a, b) => {
    const [lngA, latA] = a.location?.coordinates || [];
    const [lngB, latB] = b.location?.coordinates || [];

    if (!latA || !lngA || !latB || !lngB) return 0;

    const distA = getDistance(
      { latitude: loc.lat, longitude: loc.lng },
      { latitude: latA, longitude: lngA }
    );

    const distB = getDistance(
      { latitude: loc.lat, longitude: loc.lng },
      { latitude: latB, longitude: lngB }
    );

    return distA - distB;
  });
}

function setVisibleRestaurantData(data) {
  visibleRestaurantData = data;
  subscribers.forEach((cb) => cb(visibleRestaurantData));
}

export function onRestaurantsChange(callback) {
  subscribers.add(callback);
  if (typeof visibleRestaurantData !== "undefined") {
    try {
      callback(visibleRestaurantData);
    } catch (_) {}
  }
  return () => subscribers.delete(callback);
}
