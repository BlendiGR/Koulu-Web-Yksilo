const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";

export async function login({ username, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || "Kirjautuminen epäonnistui.";
    throw new Error(message);
  }

  return data;
}

export async function verifyToken(token) {
  const res = await fetch(`${API_BASE}/users/token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Token verification failed: ${res.status}`);
  }

  return res.json();
}
