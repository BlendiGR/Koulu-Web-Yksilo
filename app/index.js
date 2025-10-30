import "./components_authed/map.js";
import "./components_authed/restaurantCards.js";

let userData = loadUserNameAndAvatar();

export function loadUserNameAndAvatar() {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
