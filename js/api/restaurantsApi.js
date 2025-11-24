const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";

export async function fetchRestaurants() {
  const res = await fetch(`${API_BASE}/restaurants`);
  if (!res.ok) {
    throw new Error(`Failed to fetch restaurants: ${res.status}`);
  }
  return res.json();
}

export async function fetchDailyMenu(restaurantId, language = "fi") {
  const url = `${API_BASE}/restaurants/daily/${encodeURIComponent(
    restaurantId
  )}/${language}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.courses || null;
}

export async function fetchWeeklyMenu(restaurantId, language = "fi") {
  const url = `${API_BASE}/restaurants/weekly/${encodeURIComponent(
    restaurantId
  )}/${language}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.days || data?.courses || null;
}
