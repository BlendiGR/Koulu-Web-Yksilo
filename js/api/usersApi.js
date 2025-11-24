const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";
export const UPLOADS_BASE =
  "https://media2.edu.metropolia.fi/restaurant/uploads/";

export async function registerUser({ username, password, email }) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });

  if (!res.ok) {
    throw new Error(`Rekisteröinti epäonnistui: ${res.status}`);
  }

  return res.json();
}

export async function checkUsernameAvailability(username) {
  const res = await fetch(
    `${API_BASE}/users/available/${encodeURIComponent(username)}`
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return typeof data?.available === "boolean" ? data.available : null;
}

export async function uploadAvatar(token, formData) {
  const res = await fetch(`${API_BASE}/users/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

export async function refreshUserByToken(token) {
  const res = await fetch(`${API_BASE}/users/token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch fresh user data");
  }

  return res.json();
}

export async function updateFavoriteRestaurant(token, favouriteRestaurantId) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      favouriteRestaurant: favouriteRestaurantId || "",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed updating favorite");
  }

  return res.json();
}

export async function deleteUserByToken(token) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  return res;
}
