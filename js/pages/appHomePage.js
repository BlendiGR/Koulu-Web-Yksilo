import "../components/map.js";
import "../components/restaurantCardsAuthed.js";
import { ensureAuthenticated } from "../components/authGuard.js";
import { UPLOADS_BASE } from "../api/usersApi.js";

(async function initAppHomePage() {
  const userData = await ensureAuthenticated();
  if (!userData) return;

  const avatarImgNav = document.getElementById("profile-avatar-nav");
  if (avatarImgNav) {
    if (userData.data?.avatar) {
      avatarImgNav.src = `${UPLOADS_BASE}${encodeURIComponent(
        userData.data.avatar
      )}`;
    } else {
      avatarImgNav.src = "../public/avatar.jpg";
    }
  }

  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();
